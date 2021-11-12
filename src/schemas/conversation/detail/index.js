import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    id: {
        title: "编号",
        listHide: true,
    },
    node_key: {
        title: "节点",
        type: schemaFieldType.Select,
        render: (item) => {
            return <div style={{ minWidth: "100px" }}>{item}</div>
        },
    },
    type: {
        title: "类型",
        type: schemaFieldType.Select,
        dict: {
            receive: {
                value: "receive",
                remark: "接收",
            },
            reply: {
                value: "reply",
                remark: "回复",
            },
            action: {
                value: "action",
                remark: "操作",
            },
        },
        render: (item) => {
            return <div style={{ minWidth: "100px" }}>{item}</div>
        },
    },
    intent_history_id: {
        title: "意图",
        type: schemaFieldType.Select,
        width: 100,
        render: (item) => {
            return <div style={{ minWidth: "100px" }}>{item}</div>
        },
    },
    text: {
        title: "文本",
        width: 350,
    },
    action_key: {
        title: "操作",
        type: schemaFieldType.Select,
        render: (item) => {
            return <div style={{ minWidth: "100px" }}>{item}</div>
        },
    },
    slot: {
        title: "槽位",
        width: 350,
        render: (item, record) => <span>{JSON.stringify(item)}</span>,
    },
}

const service = createApi("conversation_detail", schema, null, "eq.")

service.getDetail = (args) => {
    return createApi("conversation_detail", schema, null, "eq.").get({
        ...args,
        select: "*,intent_history(*)",
    })
}

export default {
    schema,
    service,
}
