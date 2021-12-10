import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import schema from "@/schemas/mark/repeat"

import {
    Button,
    Popconfirm,
    Divider,
    message,
    Dropdown,
    Menu,
    AutoComplete,
    Input,
} from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import { LoadingOutlined, DownOutlined } from "@ant-design/icons"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

const { decorateList } = frSchema

const { utils } = frSchema

function unique(arr) {
    return Array.from(new Set(arr))
}
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            showSelect: true,
            schema: schema,
            addHide: true,
            // service: schemas.mark.service,
            service: {
                ...schemas.mark.service,
                get: schemas.mark.service.getRepeat,
            },
            infoProps: {
                width: "1200px",
                isCustomize: true,
                customize: {
                    left: 10,
                    right: 14,
                },
            },
            queryArgs: {
                ...props.queryArgs,
                type: "merge_question",
                // type: "add_question_extend",
            },
            operateWidth: "120px",
        })
    }

    async componentDidMount() {
        let project = await schemas.project.service.get({
            limit: 10000,
        })
        this.schema.project_id.dict = listToDict(project.list)
        try {
            this.formRef.current.setFieldsValue({ status: "0" })
        } catch (error) {}
        this.schema.calibration_question_standard.render = (item, data) => {
            return (
                <a
                    onClick={() => {
                        this.handleVisibleModal(
                            true,
                            {
                                ...data,
                                id: data.calibration_question_id,
                            },
                            "show"
                        )
                    }}
                >
                    {item}
                </a>
            )
        }
        this.schema.compare_question_standard.render = (item, data) => {
            return (
                <a
                    onClick={() => {
                        this.handleVisibleModal(
                            true,
                            {
                                ...data,
                                id: data.compare_question_id,
                            },
                            "show"
                        )
                    }}
                >
                    {item}
                </a>
            )
        }
        super.componentDidMount()
    }

    async requestList(tempArgs = {}) {
        const { queryArgs } = this.meta

        let searchParams = this.getSearchParam()

        const params = {
            ...(queryArgs || {}),
            ...searchParams,
            ...(this.state.pagination || {}),
            ...tempArgs,
            status: this.formRef.current.getFieldsValue().status,
        }

        let data = await this.service.get(params)
        data = this.dataConvert(data)
        return data
    }

    handleFormReset = () => {
        const { order } = this.props

        this.formRef.current.resetFields()
        this.formRef.current.setFieldsValue({ status: "0" })
        this.setState(
            {
                pagination: { ...this.state.pagination, currentPage: 1 },
                searchValues: { order },
            },
            () => {
                this.refreshList()
            }
        )
    }

    handleDeleteQuestion = async (data) => {
        // 更新
        console.log(data)
        let response
        if (!this.props.offline) {
            response = await schemas.question.service.delete({
                id: data.delete_id,
            })
            response = await this.service.patch(
                { id: data.id, status: 1 },
                schema
            )
        }
        const showMessage = (response && response.msg) || "删除成功"
        this.setState({
            data: this.state.data,
        })
        this.refreshList()
        message.success(showMessage)
        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()
        return response
    }

    handleDeleteQuestionText = async (data) => {
        // 更新
        console.log(data)
        let response
        if (!this.props.offline) {
            let res = await schemas.question.service.getDetail({
                id: data.delete_id,
            })
            console.log(res)
            let question_extend = res.question_extend
            if (question_extend) {
                question_extend = question_extend.split("\n")
                question_extend = question_extend.filter((item) => {
                    if (data.type_delete === "calibration") {
                        return item !== data.calibration_question_text
                    } else {
                        return item !== data.compare_question_text
                    }
                })

                question_extend = question_extend.join("\n")
            }
            response = await schemas.question.service.patch(
                { id: data.delete_id, question_extend },
                schemas.question.schema
            )
            response = await this.service.patch(
                { id: data.id, status: 1 },
                schema
            )
        }
        const showMessage = (response && response.msg) || "删除成功"
        this.setState({
            data: this.state.data,
        })
        this.refreshList()
        message.success(showMessage)
        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()
        return response
    }

    handMergeQuestion = async (calibration_id, compare_id, data) => {
        this.setState({ listLoading: true })
        let res = await schemas.question.service.getDetails({
            id: "in.(" + calibration_id + "," + compare_id + ")",
        })
        let list = res.list
        let compare
        let calibration
        list.map((item) => {
            if (item.id === calibration_id) {
                calibration = item
            }
            if (item.id === compare_id) {
                compare = item
            }
        })
        let response
        try {
            let question_extend = compare.question_extend
                ? [...compare.question_extend]
                : []
            question_extend.push(calibration.question_standard)
            if (calibration.question_extend) {
                question_extend = [
                    ...question_extend,
                    ...calibration.question_extend,
                ]
            }

            response = await schemas.question.service.patch(
                { id: compare_id, question_extend: unique(question_extend) },
                schemas.question.schema
            )
            response = await schemas.question.service.delete({
                id: calibration_id,
            })
            response = await this.service.patch(
                { id: data.id, status: 1 },
                schema
            )
            this.refreshList()
            message.success("合并成功！")
        } catch (error) {
            message.error("合并失败！")
        }

        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()
        return response
    }

    renderOperationMulit() {
        return (
            <span>
                {
                    <Popconfirm
                        title="是否要丢弃选中的数据？"
                        onConfirm={(e) => {
                            const { dispatch } = this.props
                            const { selectedRows } = this.state
                            let idArray = []
                            selectedRows.map((item) => {
                                if (item.status !== 1) {
                                    idArray.push(item.id)
                                }
                                return item
                            })
                            let ids = idArray.join(",")
                            console.log(ids)
                            this.handleDelete({ id: ids })
                        }}
                    >
                        <Button>丢弃</Button>
                    </Popconfirm>
                }
            </span>
        )
    }

    renderOperateColumnExtend(record) {
        const { inDel } = this.state
        const moreMenu = (
            <Menu>
                <Menu.Item>
                    <Popconfirm
                        title="是否要合并问题？"
                        onConfirm={async (e) => {
                            this.setState({ record })
                            await this.handMergeQuestion(
                                record.calibration_question_id,
                                record.compare_question_id,
                                record
                            )
                            e.stopPropagation()
                        }}
                    >
                        <a>合并问题</a>
                    </Popconfirm>
                </Menu.Item>
                <Menu.Item>
                    <Popconfirm
                        title="是否要删除检测问题？"
                        onConfirm={async (e) => {
                            this.setState({ record })
                            await this.handleDeleteQuestion({
                                delete_id: record.calibration_question_id,
                                ...record,
                            })
                            e.stopPropagation()
                        }}
                    >
                        <a>
                            {inDel &&
                                this.state.record &&
                                this.state.record.id &&
                                this.state.record.id === record.id && (
                                    <LoadingOutlined />
                                )}
                            删除检测问题
                        </a>
                    </Popconfirm>
                </Menu.Item>
                <Menu.Item>
                    <Popconfirm
                        title="是否要删除对比问题？"
                        onConfirm={async (e) => {
                            this.setState({ record })
                            await this.handleDeleteQuestion({
                                delete_id: record.compare_question_id,
                                ...record,
                            })
                            e.stopPropagation()
                        }}
                    >
                        <a>
                            {inDel &&
                                this.state.record &&
                                this.state.record.id &&
                                this.state.record.id === record.id && (
                                    <LoadingOutlined />
                                )}
                            删除对比问题
                        </a>
                    </Popconfirm>
                </Menu.Item>
                {record.calibration_question_standard !==
                    record.calibration_question_text && (
                    <Menu.Item>
                        <Popconfirm
                            title="是否要删除检测文本？"
                            onConfirm={async (e) => {
                                this.setState({ record })
                                await this.handleDeleteQuestionText({
                                    delete_id: record.calibration_question_id,
                                    ...record,
                                    type_delete: "calibration",
                                })
                                e.stopPropagation()
                            }}
                        >
                            <a>
                                {inDel &&
                                    this.state.record &&
                                    this.state.record.id &&
                                    this.state.record.id === record.id && (
                                        <LoadingOutlined />
                                    )}
                                删除检测文本
                            </a>
                        </Popconfirm>
                    </Menu.Item>
                )}
                {record.compare_question_standard !==
                    record.compare_question_text && (
                    <Menu.Item>
                        <Popconfirm
                            title="是否要删除对比文本？"
                            onConfirm={async (e) => {
                                this.setState({ record })
                                await this.handleDeleteQuestionText({
                                    delete_id: record.compare_question_id,
                                    ...record,
                                    type_delete: "compare",
                                })
                                e.stopPropagation()
                            }}
                        >
                            <a>
                                {inDel &&
                                    this.state.record &&
                                    this.state.record.id &&
                                    this.state.record.id === record.id && (
                                        <LoadingOutlined />
                                    )}
                                删除对比文本
                            </a>
                        </Popconfirm>
                    </Menu.Item>
                )}
            </Menu>
        )
        return (
            <>
                {record.status === 0 && <Divider type="vertical" />}
                {record.status === 0 && (
                    <Dropdown overlay={moreMenu}>
                        <a
                            className="ant-dropdown-link"
                            onClick={(e) => e.preventDefault()}
                        >
                            {"更多 "}
                            <DownOutlined />
                        </a>
                    </Dropdown>
                )}
            </>
        )
    }
    /**
     * 表格操作列
     * @returns {{width: string, fixed: (*|string), title: string, render: (function(*, *=): *)}}
     */
    renderOperateColumn(props = {}) {
        const { scroll } = this.meta
        const { inDel, inAppend } = this.state
        const { showEdit = true, showDelete = true } = {
            ...this.meta,
            ...props,
        }

        return (
            !this.meta.readOnly &&
            !this.props.readOnly && {
                title: "操作",
                width: this.meta.operateWidth,
                fixed: "right",
                render: (text, record) => (
                    <>
                        {record.status !== 2 && record.status !== 1 && (
                            <>
                                <Popconfirm
                                    title="是否要丢弃此行？"
                                    onConfirm={async (e) => {
                                        this.setState({ record })
                                        await this.handleDelete(record)
                                        e.stopPropagation()
                                    }}
                                >
                                    <a>
                                        {inDel &&
                                            this.state.record &&
                                            this.state.record.id &&
                                            this.state.record.id ===
                                                record.id && (
                                                <LoadingOutlined />
                                            )}
                                        丢弃
                                    </a>
                                </Popconfirm>
                            </>
                        )}

                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
        )
    }

    renderInfoModal(customProps = {}) {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleModal, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleModal.bind(this),
            handleUpdate: this.handleAdd.bind(this),
            handleAdd: this.handleAdd.bind(this),
        }

        return (
            visibleModal && (
                <InfoModal
                    renderForm={renderForm}
                    title={"问题详情"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={schemas.question.service}
                    schema={{
                        // id: { title: "编号" },
                        project_id: this.schema.project_id,
                        ...schemas.question.schema,
                        group: {
                            ...schemas.question.schema.group,
                            renderInput: (item, data, other) => {
                                console.log(item)
                                console.log(data, other)
                                return (
                                    <AutoComplete
                                        style={{
                                            width: "100%",
                                            maxWidth: "300px",
                                        }}
                                        disabled={other.disabled}
                                        filterOption={(inputValue, option) =>
                                            option.value
                                                .toUpperCase()
                                                .indexOf(
                                                    inputValue.toUpperCase()
                                                ) !== -1
                                        }
                                        options={this.state.options}
                                    >
                                        {/* {options} */}
                                        <Input placeholder="请输入分组"></Input>
                                    </AutoComplete>
                                )
                            },
                        },
                    }}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }

    handleDiscard = async (data, statue) => {
        // 更新
        let response
        try {
            if (!this.props.offline) {
                data = data.map((item) => {
                    return {
                        id: item.id,
                        status: statue,
                    }
                })
                response = await this.service.upInsert(data)
            }
            // this.refreshList()
        } catch (error) {
            message.error(error.message)
        }

        return response
    }

    handldAppend = async (data, schema, method = "patch") => {
        // 更新
        let response
        let argsArray = []
        try {
            if (!this.props.offline) {
                data.map((item) => {
                    argsArray.push(item.id)
                })
                response = await this.service.append(
                    { task_ids: argsArray },
                    schema
                )
            }
            // this.refreshList()
            message.success("补充成功")
        } catch (error) {
            message.error(error.message)
        }

        return response
    }
    renderSearchBar() {
        const { create_time, status } = this.schema
        const filters = this.createFilters(
            {
                create_time,
                status,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
