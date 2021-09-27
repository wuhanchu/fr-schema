import {connect} from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas/conversation/detail/index"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import IntentIdentify from "@/pages/domain/component/IntentIdentify"

import {createApi} from "@/outter/fr-schema/src/service"
import schema from "@/schemas/intent"

const {utils} = frSchema

@connect(({global}) => ({
    dict: global.dict,
}))
class ChatFlowTable extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.schema,
            service: schemas.service,
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
            scroll: {y: "459px", x: "max-content"},
        })
    }

    async componentDidMount() {
        this.props.onRef(this)
        this.findIntentList()
        await this.findFlowList()
        super.componentDidMount()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.conversationId !== nextProps.conversationId) {
            this.meta.queryArgs = {...this.meta.queryArgs, conversation_id: nextProps.conversationId}
            this.refreshList()
        }
    }

    // 意图列表-> 列表枚举展示
    async findIntentList() {
        let res = await createApi(
            "intent_history",
            this.schema,
            null,
            "eq."
        ).get({pageSize: 10000})
        res.list = res.list.map((item) => ({
            ...item,
            intentName: item.intent_rank ? item.intent_rank[0].name : "",
        }))
        this.schema.intent_history_id.dict = utils.dict.listToDict(
            res.list,
            null,
            "id",
            "intentName"
        )
        this.schema.intent_history_id.render = (item, data) => {
            return (
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
            )
        }
    }

    renderExtend() {
        const {visibleIntentIdentify, record} = this.state
        const {domainKey} = this.props
        return (
            <>
                {visibleIntentIdentify && (
                    <IntentIdentify
                        onCancel={() => {
                            this.setState({visibleIntentIdentify: false})
                        }}
                        text={record.text}
                        style={{height: "900px"}}
                        record={{key: domainKey}}
                    />
                )}
            </>
        )
    }

    async findFlowList() {
        let {flowKey, domainKey} = this.props
        const res = await schema.service.getFlowHistory({
            limit: 1000,
            flow_key: flowKey,
            config: "not.is.null",
            domain_key: domainKey,
        })
        if (res.list.length) {
            let result = res.list[0].config
            this.schema.action_key.dict = utils.dict.listToDict(
                result.action,
                null,
                "key",
                "name"
            )
            this.schema.node_key.dict = utils.dict.listToDict(
                result.node,
                null,
                "key",
                "name"
            )
        }
    }
}

export default ChatFlowTable
