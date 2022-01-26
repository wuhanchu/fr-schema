import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import moments from "moment"
import { render } from "mustache"

const schema = {
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            style: { width: "100%" },
            valueType: "dateTime",
        },
        hideInTable: true,
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            style: { width: "100%" },
            valueType: "dateTime",
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
        search: true,
        type: schemaFieldType.Select,
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

    caller: {
        title: "外呼号码",
        render: (item, data) => {
            return (data.info && data.info.CALLER) || ""
        },
    },
    called: {
        title: "被叫号码",
        render: (item, data) => {
            return (data.info && data.info.CALLED) || ""
        },
    },
    create_time: {
        title: "创建时间",
        search: false,
        sorter: true,
        props: {
            showTime: true,
            valueType: "dateTime",
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
                remark: "智能呼出",
            },
            end: {
                value: "text",
                remark: "文本对话",
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
    args.end_time = args.end_time
        ? args.end_time.format("YYYY-MM-DDTHH:mm:ss")
        : undefined
    args.begin_time = args.begin_time
        ? args.begin_time.format("YYYY-MM-DDTHH:mm:ss")
        : undefined

    if (args.intent_key) {
        args.intent_key = "eq." + args.intent_key
    }
    let data = await createApi("conversation", schema, null, "").get(args)
    let list = data.list.map((item) => {
        return { ...item.info, ...item }
    })
    return data
}

export default {
    schema,
    service,
}
