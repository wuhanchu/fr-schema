import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas/conversation/list"
import schemaDetail from "@/schemas/conversation/detail"
import React, { Fragment } from "react"
import "@ant-design/compatible/assets/index.css"
import { InputNumber, Modal, Select, TreeSelect, Button, message } from "antd"
import ConversationDetail from "@/pages/outPage/ConversationDetail"
import flowSchemas from "@/schemas/flow/index"
import userService from "@/pages/authority/user/service"
import frSchema from "@/outter/fr-schema/src"
import { getTree } from "@/pages/Flow/methods"
import intentSchema from "@/schemas/intent"
import Zip from "jszip"
import fileSaver from "file-saver"

const { utils } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
class Conversation extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.schema,
            service: schemas.service,
            operateWidth: "170px",
            showEdit: false,
            showDelete: false,
            // showSelect: true,

            addHide: true,
            queryArgs: {
                order: "create_time.desc",
            },
        })
        this.state = {
            ...this.state,
            showDetail: false,
            showIntent: true,
            detail: {},
            showIntentFlow: true,
        }
    }

    /**
     * 重置查询
     */
    handleFormReset = () => {
        const { order } = this.props
        let treeList = this.state.treeList
        this.setState({ showIntent: false })

        // let list = getTree(this.state.intentList)

        this.formRef.current.resetFields()
        this.setState(
            {
                pagination: { ...this.state.pagination, currentPage: 1 },
                searchValues: { order },
            },
            () => {
                this.refreshList()
            }
        )
        this.schema.intent_key.renderInput = (data, item, props) => {
            return (
                <TreeSelect
                    showSearch
                    allowClear
                    treeNodeFilterProp="name"
                    style={{ width: "100%" }}
                    placeholder={"请选择意图"}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    treeData={treeList}
                    treeDefaultExpandAll
                />
            )
        }
        this.setState({ showIntent: true })
    }

    async handleExport() {
        this.setState({ exportLoading: true })
        let data = await this.requestList({
            pageSize: 100,
            offset: 0,
            // ...args,
        })
        let ids = data.list.map((item) => {
            return item.id
        })
        let details = await schemaDetail.service.get({
            conversation_id: "in.(" + ids.join(",") + ")",
            limit: 100000,
            order: "create_time.desc",
        })
        let conversation = {}
        const zip = new Zip()
        ids.map((item) => {
            conversation[item] = details.list.filter(
                (list) => item === list.conversation_id
            )
            let content = ""
            conversation[item].map((item) => {
                if (item.type == "reply" && item.text) {
                    content = content + "robot:" + item.text + "\n"
                }
                if (item.type == "receive" && item.text) {
                    content = content + "customer:" + item.text + "\n"
                }
            })
            console.log(item, conversation[item])
            zip.file(item + ".txt", content)
        })
        zip.generateAsync({
            type: "blob",
        }).then((content) => {
            fileSaver.saveAs(content, `对话文本.zip`)
        })
        this.setState({ exportLoading: false })

        message.success("导出成功")
        console.log(conversation)
    }

    renderOperationButtons() {
        if (this.props.renderOperationButtons) {
            return this.props.renderOperationButtons()
        }

        return (
            <>
                <Button
                    loading={this.state.exportLoading}
                    onClick={() => {
                        // this.setState({ visibleExport: true })
                        // this.refreshList({})
                        this.handleExport({}, {})
                    }}
                >
                    导出
                </Button>
            </>
        )
    }

    async componentDidMount() {
        let { location } = this.props
        // 外链
        if (location.pathname.startsWith("/outter")) {
            let showIntentFlow =
                location.query &&
                location.query.showIntentFlow &&
                location.query.showIntentFlow === "true"
            this.setState({ showIntentFlow })
        }
        this.schema.domain_key.dict = this.props.dict.domain
        await this.findFlowList()
        await this.findUserList()
        const res = await intentSchema.service.get({
            limit: 1000,
            key: "not.eq.null",
        })
        let list = getTree(res.list)
        this.setState({ intentList: res.list })
        this.schema.intent_key.renderInput = (data, item, props) => {
            return (
                <TreeSelect
                    showSearch
                    allowClear
                    treeNodeFilterProp="name"
                    style={{ width: "100%" }}
                    placeholder={"请选择意图"}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    treeData={list}
                    treeDefaultExpandAll
                />
            )
        }
        this.setState({
            treeList: list,
        })
        super.componentDidMount()
    }

    // 搜索
    renderSearchBar() {
        const {
            domain_key,
            begin_time,
            end_time,
            flow_key,
            status,
            intent_key,
            call_id,
            called,
            caller,
        } = this.schema
        const filters = this.createFilters(
            {
                begin_time,
                end_time,
                domain_key,
                status,
                flow_key,
                intent_key,
                called,
                caller,
                call_id,
            },
            4
        )
        return this.state.showIntent && this.createSearchBar(filters)
    }

    /**
     * 表格操作列，扩展方法
     */
    renderOperateColumnExtend(record) {
        return (
            <Fragment>
                <a onClick={() => this.showDetail(record)}>详情</a>
            </Fragment>
        )
    }

    /**
     * 列表扩展
     */
    renderExtend() {
        return <>{this.renderDetailModal()}</>
    }

    // 详情弹窗
    renderDetailModal() {
        let { showDetail, detail, showIntentFlow } = this.state
        return (
            <Modal
                visible={showDetail}
                title="会话详情"
                onCancel={(_) => this.setState({ showDetail: false })}
                footer={null}
                width="90%"
                destroyOnClose
            >
                <ConversationDetail
                    conversation_id={detail.id}
                    flow_key={detail.flow_key}
                    domain_key={detail.domain_key}
                    roomHeight="60vh"
                    create_time={detail.create_time}
                    showIntentFlow={showIntentFlow}
                />
            </Modal>
        )
    }

    // 显示详情
    showDetail(record) {
        this.setState({ showDetail: true, detail: { ...record } })
    }

    // 流程列表-> 列表枚举展示
    async findFlowList() {
        let res = await flowSchemas.service.get({ pageSize: 10000 })
        console.log(res)
        let dict = utils.dict.listToDict(res.list, null, "key", "name")
        let list = res.list.map((item) => {
            return {
                ...item,
                label: item.name,
                value: item.key,
            }
        })
        this.schema.flow_key.dict = dict
        this.schema.flow_key.renderInput = (item, data, props) => {
            return (
                <Select
                    {...props}
                    options={list}
                    onChange={(value) => {
                        let treeList = this.state.treeList
                        let treeData = getTree(this.state.intentList)
                        let flowIntent = []
                        this.setState({ showIntent: undefined })
                        if (
                            value &&
                            item.dict[value].config &&
                            item.dict[value].config.condition
                        ) {
                            item.dict[value].config.condition.map((items) => {
                                if (items.intent) flowIntent.push(items.intent)
                            })
                            treeData = this.state.intentList.filter((items) => {
                                return flowIntent.indexOf(items.key) > -1
                            })
                            treeData = treeData.map((items) => {
                                return {
                                    ...item,
                                    value: items.key,
                                    label: items.name,
                                }
                            })
                        }
                        this.schema.intent_key.renderInput = () => (
                            <TreeSelect
                                showSearch
                                allowClear
                                treeNodeFilterProp="name"
                                style={{ width: "100%" }}
                                placeholder={"请选择意图"}
                                dropdownStyle={{
                                    maxHeight: 400,
                                    overflow: "auto",
                                }}
                                treeData={treeData}
                                treeDefaultExpandAll
                            />
                        )
                        this.setState({ showIntent: [] })
                    }}
                    allowClear
                ></Select>
            )
        }
    }

    // 流程列表-> 列表枚举展示
    async findUserList() {
        let res = await userService.get({ pageSize: 10000 })
        this.schema.user_id.dict = utils.dict.listToDict(
            res.list,
            null,
            "id",
            "name"
        )
    }
}

export default Conversation
