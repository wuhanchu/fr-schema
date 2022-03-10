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
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    user_id: {
        title: "用户",
        search: true,
        sorter: true,

        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            mode: "tags",

            showSearch: true,
        },
    },
    user_reply: {
        title: "客户回应",
        type: schemaFieldType.Select,
        sorter: true,

        props: {
            allowClear: true,
            showSearch: true,
        },
        hideInTable: true,
        dict: {
            true: {
                value: "true",
                remark: "有回应",
            },

            false: {
                value: "false",
                remark: "全部",
            },
        },
    },
    status: {
        title: "状态",

        sorter: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
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
    call_id: {
        title: "类型",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        hideInTable: true,
        dict: {
            call: {
                value: "call",
                remark: "智能呼出",
            },
            text: {
                value: "text",
                remark: "文本对话",
            },
        },
    },
    flow_key: {
        title: "流程",
        sorter: true,

        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },

    intent_key: {
        title: "意图",
        hideInTable: true,
        sorter: true,

        addHide: true,
        editHide: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
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
}

const service = createApi("conversation", schema, null, "eq.")
service.get = async (args) => {
    if (args.call_id === "call") {
        args.call_id = "not.is.null"
    }
    if (args.call_id === "text") {
        args.call_id = "is.null"
    }
    let time
    if (typeof args.begin_time === "string") {
        time = new Date(parseInt(args.begin_time))
        args.begin_time = args.begin_time
            ? moments(time).format("YYYY-MM-DDTHH:mm:ss")
            : undefined
    } else {
        console.log(args.begin_time)
        if (args.begin_time)
            args.begin_time = args.begin_time
                ? args.begin_time.format("YYYY-MM-DDTHH:mm:ss")
                : undefined
    }

    if (typeof args.end_time === "string") {
        time = new Date(parseInt(args.end_time))
        args.end_time = args.end_time
            ? moments(time).format("YYYY-MM-DDTHH:mm:ss")
            : undefined
    } else {
        console.log(args.end_time)
        if (args.end_time)
            args.end_time = args.end_time
                ? args.end_time.format("YYYY-MM-DDTHH:mm:ss")
                : undefined
    }
    // args.end_time = args.end_time
    //     ? args.end_time.format("YYYY-MM-DDTHH:mm:ss")
    //     : undefined
    // args.begin_time = args.begin_time
    //     ? args.begin_time.format("YYYY-MM-DDTHH:mm:ss")
    //     : undefined

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
