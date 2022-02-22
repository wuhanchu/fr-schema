import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import schema from "@/schemas/mark/add"
import React from "react"
import { Button, Popconfirm, Divider, message, AutoComplete, Input } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import { LoadingOutlined } from "@ant-design/icons"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

const { utils } = frSchema
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
            service: schemas.mark.service,
            queryArgs: {
                ...props.queryArgs,
                type: "add_question",
                status: "eq.wait",
            },
            scroll: { x: "max-content", y: "50vh" },
            operateWidth: "150px",
            infoProps: {
                offline: true,
                width: "1200px",
                isCustomize: true,
                customize: {
                    left: 10,
                    right: 14,
                },
            },
        })
    }

    async componentDidMount() {
        let project = await schemas.project.service.get({
            limit: 10000,
        })
        this.schema.domain_key.dict = this.props.dict.domain
        this.schema.project_id.dict = listToDict(project.list)
        const response = await schemas.question.service.get({
            ...this.meta.queryArgs,
            type: undefined,
            select: "label,group",
            limit: 9999,
            status: undefined,
        })

        let labelDictList = {}
        let groupDictList = {}

        response.list.forEach((item) => {
            if (!_.isNil(item.label)) {
                item.label.forEach((value) => {
                    labelDictList[value] = {
                        value: value,
                        remark: value,
                    }
                })
            }
            if (!_.isNil(item.group)) {
                groupDictList[item.group] = {
                    value: item.group,
                    remark: item.group,
                }
            }
        })
        let options = []
        Object.keys(groupDictList).forEach(function (key) {
            options.push({
                key: groupDictList[key].value,
                value: groupDictList[key].value,
            })
        })
        try {
            this.formRef.current.setFieldsValue({ status: "wait" })
        } catch (error) {}
        this.setState({ options: options })
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
        this.formRef.current.setFieldsValue({ status: "wait" })
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
                                if (item.status !== "deny") {
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
                {
                    <Popconfirm
                        title="是否要删除选中的数据？"
                        onConfirm={(e) => {
                            const { dispatch } = this.props
                            const { selectedRows } = this.state
                            this.handleDeleteMulti(selectedRows)
                        }}
                    >
                        <Button>批量删除</Button>
                    </Popconfirm>
                }
            </span>
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
                    title={title}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={schemas.question.service}
                    schema={{
                        project_id: this.schema.project_id,
                        ...schemas.question.schema,
                        group: {
                            ...schemas.question.schema.group,
                            renderInput: (item, data) => {
                                return (
                                    <AutoComplete
                                        style={{
                                            width: "100%",
                                            maxWidth: "300px",
                                        }}
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

    async handleAdd(data, schema) {
        // 更新
        // console.log(this.state.record)

        let response
        try {
            if (!this.props.offline) {
                data.id = undefined
                response = await schemas.question.service.post(data, schema)
                console.log(this.state.infoData)
                response = await this.service.patch(
                    { id: this.state.infoData.id, status: "deny" },
                    schema
                )
            } else {
                // 修改当前数据
                this.state.data.list.push(decorateItem(data, this.schema))
                this.setState({
                    data: this.state.data,
                })
            }

            this.refreshList()
            message.success("添加成功")
        } catch (error) {
            message.error(error.message)
        }

        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

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
                        {record.status !== "deny" && (
                            <>
                                <a
                                    onClick={() =>
                                        this.handleVisibleModal(
                                            true,
                                            {
                                                ...record,
                                                question_extend: record.text.join(
                                                    "\n"
                                                ),
                                            },
                                            "edit"
                                        )
                                    }
                                >
                                    新增
                                </a>
                            </>
                        )}
                        {record.status === "wait" && (
                            <Divider type="vertical" />
                        )}
                        {record.status !== "deny" && record.status !== "end" && (
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
                        <Divider type="vertical" />
                        <>
                            <Popconfirm
                                title="是否要丢弃此行？"
                                onConfirm={async (e) => {
                                    this.setState({ record })
                                    await this.handleDeleteRow(record)
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
                                    删除
                                </a>
                            </Popconfirm>
                        </>
                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
        )
    }

    handleDeleteRow = async (data) => {
        // 更新
        let response

        const showMessage = (response && response.msg) || "删除成功"

        // 修改当前数据

        if (!this.props.offline) {
            response = await this.service.delete({ id: data.id, ...data })
        }

        this.state.data.list.some((item, index) => {
            if (data.id == item.id) {
                this.state.data.list.splice(index, 1)
                return true
            }
        })
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
