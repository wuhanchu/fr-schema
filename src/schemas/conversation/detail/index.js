import {createApi} from "@/outter/fr-schema/src/service"
import {schemaFieldType} from "@/outter/fr-schema/src/schema";

const schema = {
    id: {
        title: '编号',
        listHide: true,
    },
    node_key: {
        title: '节点',
        type: schemaFieldType.Select,
    },
    type: {
        title: '类型',
        type: schemaFieldType.Select,
        dict: {
            receive: {
                value: 'receive',
                remark: '接受'
            },
            reply: {
                value: 'reply',
                remark: '回复'
            },
            action: {
                value: 'action',
                remark: '行为'
            }
        }
    },
    text: {
        title: '文本'
    },
    action_type: {
        title: '行为',
        type: schemaFieldType.Select,
    },
    intent_history_id: {
        title: '意图',
        type: schemaFieldType.Select,
        width: 110
    },
    slot: {
        title: '槽位',
        render: (item, record) => <span>{JSON.stringify(item)}</span>
    },
}

const service = createApi("conversation_detail", schema, null, "eq.")

export default {
    schema,
    service,
}
