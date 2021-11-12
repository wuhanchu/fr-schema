import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas/conversation/detail/index"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import IntentIdentify from "@/pages/domain/component/IntentIdentify"

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
                pageSize: 10000,
                limit: 10000,
                conversation_id: props.conversationId,
                order: "create_time",
            },
            operateWidth: "120px",
            addHide: true,
            mini: true,
            readOnly: true,
            scroll: { y: "459px", x: "max-content" },
        })
    }

    async componentDidMount() {
        this.props.onRef(this)
        await this.findIntentList()
        await this.findFlowList()
        super.componentDidMount()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.conversationId !== nextProps.conversationId) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                conversation_id: nextProps.conversationId,
            }
            this.refreshList()
        }
    }

    // 意图列表-> 列表枚举展示
    async findIntentList() {
        this.schema.intent_history_id.render = (item, data) => {
            return (
                (data.intent_history &&
                    data.intent_history.intent_rank &&
                    data.intent_history.intent_rank[0].name) ||
                "未知"
            )
        }
        this.schema.text.render = (item, data) => {
            return data.type === "receive" ? (
                <a
                    onClick={() => {
                        console.log(this.props, data.text)
                        this.setState({
                            visibleIntentIdentify: true,
                            record: data,
                        })
                    }}
                >
                    {item}
                </a>
            ) : (
                item
            )
        }
    }

    renderExtend() {
        const { visibleIntentIdentify, record } = this.state
        const { domainKey } = this.props
        return (
            <>
                {visibleIntentIdentify && (
                    <IntentIdentify
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

    async findFlowList() {
        let { flowKey, domainKey, create_time } = this.props
        const res = await schema.service.getFlowHistory({
            limit: 1000,
            flow_key: flowKey,
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
        // res.list.map((item) => {
        //     action.push(...item.config.action)
        //     node.push(...item.config.node)
        // })
        console.log(res.list)

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
