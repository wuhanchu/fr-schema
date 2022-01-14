import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import moments from "moment"

const schema = {
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            style: { width: "100%" },
        },
        hideInTable: true,
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            style: { width: "100%" },
        },
        hideInTable: true,
    },

    id: {
        title: "编号",
        addHide: true,
        editHide: true,
        search: false,
        sorter: true,
        width: "320px",
    },
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
    },
    user_id: {
        title: "用户",
        search: false,
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
        hideInTable: true,
        addHide: true,
        editHide: true,
        type: schemaFieldType.Select,
    },
    create_time: {
        title: "创建时间",
        search: false,
        sorter: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
    call_id: {
        title: "类型",
        type: schemaFieldType.Select,
        hideInTable: true,
        dict: {
            running: {
                value: "call",
                remark: "外呼",
            },
            end: {
                value: "text",
                remark: "文本",
            },
        },
    },
}

const service = createApi("conversation", schema, null, "eq.")
service.get = async (args) => {
    if (args.call_id === "call") {
        args.call_id = "not.is.null"
    }
    if (args.call_id === "text") {
        args.call_id = "is.null"
    }
    let time = new Date(parseInt(args.end_time))
    console.log(time)
    args.end_time = args.end_time
        ? moments(time).format("YYYY-MM-DDThh:mm:ss")
        : undefined
    time = new Date(parseInt(args.begin_time))
    console.log(time)

    args.begin_time = args.begin_time
        ? moments(time).format("YYYY-MM-DDThh:mm:ss")
        : undefined

    if (args.intent_key) {
        args.intent_key = "eq." + args.intent_key
    }
    let data = await createApi("conversation", schema, null, "").get(args)
    return data
}

export default {
    schema,
    service,
}
