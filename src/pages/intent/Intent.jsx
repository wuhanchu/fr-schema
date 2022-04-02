import { connect } from "dva"
import schemas from "@/schemas/mark/intent"
import intentSchemas from "@/schemas/intent"
import React from "react"
import { Divider, Popconfirm, message, Button, Dropdown, Menu } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import { listToDict } from "@/outter/fr-schema/src/dict"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import { LoadingOutlined, DownOutlined } from "@ant-design/icons"

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
            schema: schemas.schema,
            showSelect: true,
            service: schemas.service,
            initLocalStorageDomainKey: true,
            operateWidth: "200px",
            queryArgs: {
                ...props.queryArgs,
                domain_key: props.domain_key,
            },
        })
    }

    componentWillReceiveProps(nextProps, nextContents) {
        super.componentWillReceiveProps(nextProps, nextContents)
        if (nextProps.domain_key !== this.props.domain_key) {
            // sth值发生改变下一步工作
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: nextProps.domain_key,
            }
            this.refreshList()
        }
    }

    async componentDidMount() {
        let intent = await intentSchemas.service.get({
            limit: "10000",
            select: "id, key, name",
        })

        let intentDict = listToDict(intent.list, "", "id", "name")
        this.schema.intent_id.dict = intentDict
        this.schema.calibration_intent_id.dict = intentDict
        this.schema.calibration_intent_id.render = (item, data) => {
            return (
                <a
                    onClick={() => {
                        this.setState({ record: data })
                        this.handleVisibleModal(
                            true,
                            {
                                ...data,
                                id: data.calibration_intent_id,
                            },
                            "edit"
                        )
                    }}
                >
                    {item}
                </a>
            )
        }
        this.schema.compare_intent_id.render = (item, data) => {
            return (
                <a
                    onClick={() => {
                        this.setState({ record: data })
                        this.handleVisibleModal(
                            true,
                            {
                                ...data,
                                id: data.compare_intent_id,
                            },
                            "edit"
                        )
                    }}
                >
                    {item}
                </a>
            )
        }
        this.schema.compare_intent_id.dict = intentDict
        this.formRef.current.setFieldsValue({ status: "wait" })

        super.componentDidMount()
        this.schema.domain_key.dict = this.props.dict.domain
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
    renderSearchBar() {
        const { name, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }

    async handleDeleteText(data, schema, deleteType) {
        // 更新
        let response
        try {
            response = await intentSchemas.service.getDetail(
                {
                    id:
                        deleteType === "compare_intent_id"
                            ? data.compare_intent_id
                            : data.calibration_intent_id,
                },
                schema
            )

            if (data.type === "merge_intent" && response) {
                await intentSchemas.service.patch(
                    {
                        id:
                            deleteType === "compare_intent_id"
                                ? data.compare_intent_id
                                : data.calibration_intent_id,
                        regex: response.regex.filter((item) => {
                            return item != data.regex
                        }),
                        standard_discourse: response.standard_discourse,
                    },
                    schema
                )
            } else {
                if (data.type === "merge_standard_discourse") {
                    let standard_discourse = response.standard_discourse.split(
                        "\n"
                    )
                    await intentSchemas.service.patch(
                        {
                            id:
                                deleteType === "compare_intent_id"
                                    ? data.compare_intent_id
                                    : data.calibration_intent_id,
                            regex: response.regex,
                            standard_discourse:
                                response.standard_discourse &&
                                standard_discourse
                                    .filter((item) => {
                                        if (
                                            deleteType === "compare_intent_id"
                                        ) {
                                            return (
                                                item != data.compare_intent_text
                                            )
                                        } else {
                                            return (
                                                item !=
                                                data.calibration_intent_text
                                            )
                                        }
                                    })
                                    .join("\n"),
                        },
                        schema
                    )
                }
            }
            response = await this.service.patch(
                {
                    id: data.id,
                    status: "end",
                    domain_key: this.state.record.domain_key,
                },
                schema
            )

            this.refreshList()
            message.success("操作成功")
        } catch (error) {
            message.error(error.message)
        }

        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    async handleDeleteMoreText(data, schema) {
        // 更新
        let response
        try {
            response = await intentSchemas.service.get(
                {
                    id:
                        "in.(" +
                        data.compare_intent_id +
                        "," +
                        data.calibration_intent_id +
                        ")",
                },
                schema
            )

            if (data.type === "merge_intent" && response) {
                // console.log(response)
                // console.log()
                let list = response.list.map((item) => {
                    return {
                        ...item,
                        children: undefined,
                        itemKey: undefined,
                        tier: undefined,
                        create_time: undefined,
                        standard_discourse: item.standard_discourse.split("\n"),
                        regex: item.regex.split("\n").filter((items) => {
                            return items != data.regex
                        }),
                    }
                })
                await intentSchemas.service.upInsert(list, schema)
            } else {
                if (data.type === "merge_standard_discourse") {
                    let list = response.list.map((item) => {
                        let standard_discourse = item.standard_discourse.split(
                            "\n"
                        )

                        return {
                            ...item,
                            children: undefined,
                            tier: undefined,
                            create_time: undefined,
                            itemKey: undefined,
                            regex: item.regex.split("\n"),
                            standard_discourse:
                                item.standard_discourse &&
                                standard_discourse.filter((item) => {
                                    if (item === data.compare_intent_id) {
                                        return item != data.compare_intent_text
                                    } else {
                                        return (
                                            item != data.calibration_intent_text
                                        )
                                    }
                                }),
                        }
                    })
                    await intentSchemas.service.upInsert(list, schema)
                }
            }
            response = await this.service.patch(
                {
                    id: data.id,
                    status: "end",
                    domain_key: this.state.record.domain_key,
                },
                schema
            )

            this.refreshList()
            message.success("操作成功")
        } catch (error) {
            message.error(error.message)
        }

        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    handleUpdate = async (data, schema) => {
        let method
        if (data.id) {
            method = "patch"
        } else {
            method = "post"
        }
        // 更新
        let response
        data.regex = data.regex
            ? typeof data.regex === "string"
                ? data.regex.split(",")
                : data.regex
            : undefined
        data.standard_discourse =
            data.standard_discourse && data.standard_discourse

        try {
            if (!this.props.offline) {
                response = await intentSchemas.service[method](data, schema)
            }
            response = await this.service.patch(
                {
                    id: this.state.record.id,
                    status: "end",
                    domain_key: this.state.record.domain_key,
                },
                schema
            )
            this.refreshList()
            message.success("修改成功")
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }

        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    handleDenyMulti = async (recordList) => {
        const idKey = "id"
        if (!this.props.offline) {
            await this.service.deny(recordList)
        }

        this.refreshList()
        message.success("丢弃成功")
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()
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
                                if (item.status !== "end") {
                                    idArray.push(item.id)
                                }
                                return item
                            })
                            let ids = idArray.join(",")
                            this.handleDenyMulti({ id: ids })
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
                        <>
                            <Popconfirm
                                title="是否要丢弃此行？"
                                onConfirm={async (e) => {
                                    this.setState({ record })
                                    await this.handleDenyMulti({
                                        id: record.id,
                                    })
                                    e.stopPropagation()
                                }}
                            >
                                <a>丢弃</a>
                            </Popconfirm>
                        </>

                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
        )
    }
    renderOperateColumnExtend(record) {
        const moreMenu = (
            <Menu>
                <Menu.Item>
                    <Popconfirm
                        title="是否要删除检测意图中的此文本？"
                        onConfirm={async (e) => {
                            this.setState({ record })
                            await this.handleDeleteText(
                                record,
                                intentSchemas.schema,
                                "calibration_intent_id"
                            )
                            e.stopPropagation()
                        }}
                    >
                        <a>删除检测</a>
                    </Popconfirm>
                </Menu.Item>
                <Menu.Item>
                    <Popconfirm
                        title="是否要删除对比意图中的此文本？"
                        onConfirm={async (e) => {
                            this.setState({ record })
                            await this.handleDeleteText(
                                record,
                                intentSchemas.schema,
                                "compare_intent_id"
                            )
                            e.stopPropagation()
                        }}
                    >
                        <a>删除对比</a>
                    </Popconfirm>
                </Menu.Item>
                <Menu.Item>
                    <Popconfirm
                        title="是否要同时删除对比意图和检测意图中的此文本？"
                        onConfirm={async (e) => {
                            this.setState({ record })
                            await this.handleDeleteMoreText(
                                record,
                                intentSchemas.schema,
                                "compare_intent_id"
                            )
                            e.stopPropagation()
                        }}
                    >
                        <a>同步删除</a>
                    </Popconfirm>
                </Menu.Item>
            </Menu>
        )
        return (
            <>
                {<Divider type="vertical" />}
                <Popconfirm
                    title="是否要删除此行？"
                    onConfirm={async (e) => {
                        this.setState({ record })
                        await this.handleDelete(record)
                        e.stopPropagation()
                    }}
                >
                    <a>删除</a>
                </Popconfirm>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record })
                        this.handleVisibleModal(
                            true,
                            {
                                // ...record,
                                regex:
                                    record.type === "merge_intent"
                                        ? record.regex
                                        : undefined,
                                standard_discourse:
                                    record.type === "merge_standard_discourse"
                                        ? unique([
                                              record.calibration_intent_text,
                                              record.compare_intent_text,
                                          ])
                                        : undefined,
                            },
                            "edit"
                        )
                    }}
                >
                    新增
                </a>
                <Divider type="vertical" />

                <Dropdown overlay={moreMenu}>
                    <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        {"更多 "}
                        <DownOutlined />
                    </a>
                </Dropdown>
            </>
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
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleAdd.bind(this),
        }

        return (
            visibleModal && (
                <InfoModal
                    renderForm={renderForm}
                    title={"意图"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={intentSchemas.service}
                    schema={intentSchemas.schema}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }
}

export default List
