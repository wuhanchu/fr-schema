import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas/conversation/list"
import schemaDetail from "@/schemas/conversation/detail"
import React, { Fragment } from "react"
import "@ant-design/compatible/assets/index.css"
import {
    InputNumber,
    Modal,
    Select,
    TreeSelect,
    Button,
    message,
    Divider,
} from "antd"
import ConversationDetail from "@/pages/outPage/ConversationDetail"
import flowSchemas from "@/schemas/flow/index"
import userService from "@/pages/authority/user/service"
import frSchema from "@/outter/fr-schema/src"
import { getTree } from "@/pages/Flow/methods"
import { listToDict } from "@/outter/fr-schema/src/dict"
import intentSchema from "@/schemas/intent"
import Zip from "jszip"
import clone from "clone"
import fileSaver from "file-saver"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import moment from "moment"

const { utils, decorateList } = frSchema

function unique(arr, key) {
    if (!arr) return arr
    if (key === undefined) return [...new Set(arr)]
    const map = {
        string: (e) => e[key],
        function: (e) => key(e),
    }
    const fn = map[typeof key]
    const obj = arr.reduce((o, e) => ((o[fn(e)] = e), o), {})
    return Object.values(obj)
}

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
            searchSpan: 6,
            search: {
                span: 6,
            },
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
            used: [],
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
                console.log("handleFormReset", this.state.pagination)

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
            order: "create_time",
        })
        let conversation = {}
        const zip = new Zip()
        data.list.map((items) => {
            conversation[items.id] = details.list.filter(
                (list) => items.id === list.conversation_id
            )
            let content = ""
            conversation[items.id].map((item) => {
                if (item.type == "reply" && item.text) {
                    content = content + "robot:" + item.text + "\n"
                }
                if (item.type == "receive" && item.text) {
                    content = content + "customer:" + item.text + "\n"
                }
            })
            // console.log(item, conversation[item])
            let time = new Date(parseInt(items.create_time))
            zip.file(
                moment(items.create_time).format("YYYY-MM-DDHH:mm:ss") +
                    items.id +
                    ".txt",
                content
            )
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
        this.setState({ searchSpan: window.innerWidth > 1500 ? 4 : 6 })
        let { location } = this.props
        let _this = this
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
            order: "key.desc",
        })
        res.list.map((item) => {
            console.log(item.key)
        })
        let list = getTree(unique(res.list, "key"))
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
        console.log(list)
        this.setState({
            treeList: list,
        })
        super.componentDidMount()
        var oldresize = window.onresize
        window.onresize = function (e) {
            if (window.innerWidth > 1500) {
                // this.meta.searchSpan = 4
                _this.setState({
                    searchSpan: 4,
                })
            } else {
                _this.setState({
                    searchSpan: 6,
                })
            }
        }
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
        console.log(
            "this.state.used.indexOf(record.id)",
            this.state.used.indexOf(record.id)
        )
        return (
            <Fragment>
                <span className="conversationDetail">
                    <a
                        style={{
                            color:
                                this.state.used.indexOf(record.id) > -1
                                    ? "#ad4e00"
                                    : "",
                        }}
                        onClick={() => this.showDetail(record)}
                    >
                        详情
                    </a>
                    <Divider type="vertical" />
                    <a onClick={() => this.exportDetail(record)}>导出</a>
                </span>
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

    async exportDetail(record) {
        let data = await schemaDetail.service.get({
            conversation_id: record.id,
            order: "create_time",
            limit: 100000,
        })
        let list = []
        let nodeList = listToDict(
            this.schema.flow_key.dict[record.flow_key].config.node,
            "",
            "key",
            "name"
        )
        let buttons = []
        data.list.map((item) => {
            if (
                (item.type === "reply" || item.type === "receive") &&
                item.text
            ) {
                if (item.result && item.result.length) {
                    item.result.map((one) => {
                        console.log(one)
                        if (one.buttons && one.buttons.length) {
                            buttons.push(...one.buttons)
                        }
                    })
                }
                let nodeList = listToDict(
                    this.schema.flow_key.dict[item.flow_key || record.flow_key]
                        .config.node,
                    "",
                    "key",
                    "name"
                )
                if (item.node_key && nodeList[item.node_key]) {
                    item.node_key_name = nodeList[item.node_key].name
                }
                if (
                    item.intent_history &&
                    item.intent_history.intent_rank &&
                    item.intent_history.intent_rank[0].name
                ) {
                    item.intent_name = item.intent_history.intent_rank[0].name
                } else {
                    item.intent_name = "未知"
                }
                if (item.type === "reply") {
                    item.type_name = "回复"
                } else {
                    item.type_name = "接收"
                }
                list.push(item)
            }
        })
        let result = []
        let oneList = {}
        buttons = listToDict(buttons, "", "payload", "title")
        list.map((item) => {
            // console.log(item)
            if (item.type !== "receive") {
                oneList = {
                    ...item,
                    text: oneList.text
                        ? oneList.text + "\n" + item.text
                        : item.text,
                }
            } else {
                oneList = {
                    reply_text: oneList.text,
                    ...item,
                    text: buttons[item.text]
                        ? buttons[item.text].title
                        : item.text,
                }
                result.push(clone(oneList))
                oneList = {}
            }
        })
        if (oneList && oneList.text) {
            oneList = { reply_text: oneList.text, ...oneList, text: undefined }
            result.push(clone(oneList))
        }
        let columns = [
            // {
            //     title: "类型",
            //     dataIndex: "type_name",
            //     key: "type_name",
            // },
            {
                title: "流程节点",
                dataIndex: "node_key_name",
                key: "node_key_name",
            },
            {
                title: "意图",
                dataIndex: "intent_name",
                key: "intent_name",
            },
            {
                title: "AI问",
                dataIndex: "reply_text",
                key: "reply_text",
            },
            {
                title: "用户回答",
                dataIndex: "text",
                key: "text",
            },
        ]
        data = decorateList(result, this.schema)
        await exportData("流程", data, columns)
        this.setState({ exportLoading: false })
    }

    // 显示详情
    showDetail(record) {
        let used = this.state.used
        used.push(record.id)
        this.setState({ showDetail: true, detail: { ...record }, used })
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
                    placeholder="请选择流程"
                    onChange={(value) => {
                        console.log(value)
                        console.log("this.state", this.state)
                        this.formRef.current.setFieldsValue({
                            flow_key: value || undefined,
                        })
                        this.setState({
                            searchValues: {
                                ...this.state.searchValues,
                                flow_key: value || undefined,
                            },
                        })
                        let treeList = clone(this.state.treeList)
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
                                return (
                                    flowIntent.indexOf(items.key) > -1 &&
                                    item.dict[value].domain_key ===
                                        items.domain_key
                                )
                            })
                            treeData = treeData.map((items) => {
                                // console.log("结果"+)
                                return {
                                    ...items,
                                    key: items.key,
                                    value: items.key,
                                    label: items.name,
                                    children: [],
                                }
                            })
                        } else {
                            treeData = clone(treeList)
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
