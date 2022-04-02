// import { createApi } from "@/outter/fr-schema/src/service"
import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker } from "antd"
import moment from "moment"
import { render } from "mustache"

const { RangePicker } = DatePicker

const schema = {
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            showTime: true,
            valueType: "dateTime",
        },
        hideInTable: true,
    },

    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            showTime: true,
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
        search: false,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    user_id: {
        title: "操作用户",
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
        dict: {
            true: {
                value: "true",
                remark: "有回应",
            },

            false: {
                value: "false",
                remark: "无回应",
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
        sorter: true,
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
        render: (item, data) => {
            if (data.call_id) {
                return "智能呼出"
            } else {
                return "文本对话"
            }
        },
    },
    caller: {
        title: "拨出号码",

        render: (item, data) => {
            return (data.info && data.info.CALLER) || ""
        },
    },
    called: {
        title: "呼叫号码",

        render: (item, data) => {
            return (data.info && data.info.CALLED) || ""
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

    flow_key: {
        title: "流程",
        sorter: true,

        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    node_key: {
        title: "节点",
        sorter: true,
        editHide: true,
        addHide: true,
        hideInTable: true,
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
    if (args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        args.begin_time = moment(time).format("YYYY-MM-DDTHH:mm:ss")
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        args.end_time = moment(time).format("YYYY-MM-DDTHH:mm:ss")
    }

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
