import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
    },
    user_id: {
        title: "用户",
    },
    flow_key: {
        title: "流程",
        type: schemaFieldType.Select,
    },
    status: {
        title: "状态",
        sorter: true,
        type: schemaFieldType.Select,
        dict: {
            running: {
                value: "running",
                remark: "会话中",
            },
            end: {
                value: "end",
                remark: "结束",
            },
        },
    },
    intent_key: {
        title: "意图",
        listHide: true,
        addHide: true,
        editHide: true,
        type: schemaFieldType.Select,
    },
    create_time: {
        title: "创建时间",
        sorter: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("conversation", schema, null, "eq.")

export default {
    schema,
    service,
}
