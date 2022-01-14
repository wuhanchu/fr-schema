import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Button, Popconfirm, Divider, message } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import { LoadingOutlined } from "@ant-design/icons"
const { decorateList } = frSchema

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            showSelect: true,
            schema: schemas.mark.schema,
            addHide: true,
            service: schemas.mark.service,
            infoProps: {
                width: "900px",
            },
            queryArgs: {
                ...props.queryArgs,
                type: "add_question_extend",
            },
            operateWidth: "150px",
        })
    }

    async componentDidMount() {
        let project = await schemas.project.service.get({
            limit: 10000,
        })
        this.schema.project_id.dict = listToDict(project.list)
        try {
            this.formRef.current.setFieldsValue({ status: "wait" })
        } catch (error) {}
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
                <>
                    {
                        <Popconfirm
                            title="是否要补充选中的数据？"
                            onConfirm={async (e) => {
                                const { dispatch } = this.props
                                const { selectedRows } = this.state
                                await this.handldAppend(selectedRows)
                                this.refreshList()
                            }}
                        >
                            <Button type="primary">补充</Button>
                        </Popconfirm>
                    }
                </>
                {
                    <Popconfirm
                        title="是否要丢弃选中的数据？"
                        onConfirm={(e) => {
                            const { dispatch } = this.props
                            const { selectedRows } = this.state
                            let idArray = []
                            selectedRows.map((item) => {
                                if (item.status !== "end") {
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
                        {record.status !== "end" && (
                            <>
                                <Popconfirm
                                    title="是否要补充此行？"
                                    onConfirm={async (e) => {
                                        this.setState({
                                            record,
                                            inAppend: true,
                                        })
                                        await this.handldAppend([record])
                                        this.refreshList()
                                        this.setState({ inAppend: false })
                                        e.stopPropagation()
                                    }}
                                >
                                    <a>
                                        {inAppend &&
                                            this.state.record &&
                                            this.state.record.id &&
                                            this.state.record.id ===
                                                record.id && (
                                                <LoadingOutlined />
                                            )}
                                        补充
                                    </a>
                                </Popconfirm>
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
        const { create_time, status, project_id } = this.schema
        const filters = this.createFilters(
            {
                create_time,
                status,
                project_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
