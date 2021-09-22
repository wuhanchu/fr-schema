import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas/conversation/detail/index"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
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
            scroll: { y: "459px", x: "max-content" },
        })
    }

    async componentDidMount() {
        this.props.onRef(this)
        this.findIntentList()
        this.findFlowList()
        super.componentDidMount()
    }

    // 意图列表-> 列表枚举展示
    async findIntentList() {
        let res = await createApi(
            "intent_history",
            this.schema,
            null,
            "eq."
        ).get({ pageSize: 10000 })
        this.schema.intent_history_id.dict = utils.dict.listToDict(
            res.list,
            null,
            "id",
            "text"
        )
    }

    async findFlowList() {
        let { flowKey, domainKey } = this.props
        const res = await schema.service.getFlowHistory({
            limit: 1000,
            flow_key: flowKey,
            config: "not.is.null",
            domain_key: domainKey,
        })
        const dict = {
            phone_play_audio: {
                value: "phone_play_audio",
                remark: "对接电话播放音频",
            },
            reset_conversation: {
                value: "reset_conversation",
                remark: "重置会话",
            },
            node_redirect: {
                value: "node_redirect",
                remark: "执行完返回上一节点",
            },
            redirect_last_partial_node: {
                value: "redirect_last_partial_node",
                remark: "重定向当前行为前最后一个局部节点",
            },
            phone_play_tts_audio: {
                value: "phone_play_tts_audio",
                remark: "对接电话播放语音合成音频",
            },
            search: {
                value: "search",
                remark: "搜索知识库",
            },
            transfer_manual: {
                value: "transfer_manual",
                remark: "转人工",
            },
            response: {
                value: "response",
                remark: "返回生成文本",
            },
            get_question_by_global_key: {
                value: "get_question_by_global_key",
                remark: "根据全局key获取问题",
            },
            concat_text_by_slot: {
                value: "concat_text_by_slot",
                remark: "根据槽位合成文本",
            },
            return_text_by_order: {
                value: "return_text_by_order",
                remark: "多文本次序返回",
            },
            get_template: {
                value: "get_template",
                remark: "根据回复key搜索回复模板",
            },
            self_income_expenses_get_response: {
                value: "self_income_expenses_get_response",
                remark: "自有收支核算流程根据槽位搜索回复模板",
            },
            self_income_expenses_search_entity: {
                value: "self_income_expenses_search_entity",
                remark: "根据输入相似查询 想关联的实体",
            },
            self_income_expenses_balance_action: {
                value: "self_income_expenses_balance_action",
                remark: "根据不平的方向返回结果",
            },
        }
        if (res.list.length) {
            let result = res.list[0].config
            this.schema.action_type.dict = dict
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
