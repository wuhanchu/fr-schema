import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas/conversation/detail/index"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import IntentIdentify from "@/pages/domain/component/IntentIdentify"
import { Tooltip } from "antd"
import { createApi } from "@/outter/fr-schema/src/service"
import schema from "@/schemas/intent"

const { utils } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
class ChatFlowTable extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.schema,
            service: { ...schemas.service, get: schemas.service.getDetail },
            queryArgs: {
                pageSize: 1000,
                limit: 1000,
                conversation_id: props.conversationId,
                order: "create_time",
            },
            operateWidth: "120px",
            addHide: true,
            mini: true,
            readOnly: true,
            scroll: { y: "498px", x: "max-content" },
        })
    }

    async componentDidMount() {
        this.props.onRef(this)
        await this.findIntentList()
        await this.findFlowList()
        super.componentDidMount()
    }

    async componentWillReceiveProps(nextProps) {
        if (this.props.conversationId !== nextProps.conversationId) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                conversation_id: nextProps.conversationId,
            }
            this.refreshList()
        }
        if (this.props.flowKey !== nextProps.flowKey) {
            await this.findFlowList(nextProps.flowKey)
        }
    }

    // 意图列表-> 列表枚举展示
    async findIntentList() {
        this.schema.intent_history_id.render = (item, data) => {
            let text =
                (data.intent_history &&
                    data.intent_history.intent_rank &&
                    data.intent_history.intent_rank[0].name) ||
                "未知"
            return (
                <Tooltip title={text}>
                    <div
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "50px",
                        }}
                    >
                        {text}
                    </div>
                </Tooltip>
            )
        }
        this.schema.text.render = (item, data) => {
            if (data.type === "receive") {
                return (
                    <Tooltip title={item}>
                        <div
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "140px",
                                minWidth: "140px",
                            }}
                        >
                            <a
                                onClick={() => {
                                    this.setState({
                                        visibleIntentIdentify: true,
                                        record: data,
                                    })
                                }}
                            >
                                {item}
                            </a>
                        </div>
                    </Tooltip>
                )
            } else {
                if (item) {
                    return (
                        <Tooltip title={item}>
                            <div
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "140px",
                                    minWidth: "140px",
                                }}
                            >
                                {item}
                            </div>
                        </Tooltip>
                    )
                } else {
                    return <div style={{ width: "50px" }}></div>
                }
            }
        }
    }

    renderExtend() {
        const { visibleIntentIdentify, record } = this.state
        const { domainKey } = this.props
        return (
            <>
                {visibleIntentIdentify && (
                    <IntentIdentify
                        searchProject={this.props.defaultProject}
                        type={"tabs"}
                        onCancel={() => {
                            this.setState({ visibleIntentIdentify: false })
                        }}
                        text={record.text}
                        style={{ height: "900px" }}
                        record={{ key: domainKey }}
                    />
                )}
            </>
        )
    }

    async findFlowList(flow_key) {
        let { flowKey, domainKey, create_time } = this.props
        const res = await schema.service.getFlowHistory({
            limit: 10,
            flow_key: flow_key || flowKey,
            config: "not.is.null",
            domain_key: domainKey,
            order: "create_time.desc",
            create_time: create_time ? "lte." + create_time : undefined,
        })

        let action = []
        let node = []
        if (res.list[0]) {
            action.push(...res.list[0].config.action)
            node.push(...res.list[0].config.node)
        }

        if (res.list.length) {
            this.schema.action_key.dict = utils.dict.listToDict(
                action,
                null,
                "key",
                "name"
            )
            this.schema.node_key.dict = utils.dict.listToDict(
                node,
                null,
                "key",
                "name"
            )
        }
    }
}

export default ChatFlowTable
