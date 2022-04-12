import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import moment from "moment"

const schema = {
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: {
                width: "100%",
            },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: {
                width: "100%",
            },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
    },
    task_id: {
        title: "任务",
        required: true,
        hideInTable: true,
        // search: false,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    flow_key: {
        title: "流程",
        required: true,
        hideInTable: true,
        // search: false,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    user_id: {
        title: "操作用户",
        type: schemaFieldType.Select,
        addHide: true,
        hideInTable: true,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    client_id: {
        // search: false,
        title: "渠道",
        hideInTable: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    create_date: {
        title: "日期",
        search: false,
    },
    total: {
        title: "总外呼",
        search: false,
    },
    connected: {
        title: "接通",
        search: false,
    },
    no_connect: {
        title: "未接通",
        search: false,
    },
    refuse: {
        title: "拒接",
        search: false,
    },
    connected_rate: {
        title: "接通率",
        search: false,
        // sorter: true,
        render: (item) => {
            return Math.round(item * 100 * 10 ** 2) / 10 ** 2 + "%"
        },
    },
    no_answer: {
        title: "无应答",
        search: false,
    },
    failed: {
        title: "拨打失败",
        search: false,
    },
    busy: {
        title: "忙线",
        search: false,
    },
    empty: {
        title: "空号",
        search: false,
    },
    shutdown: {
        title: "关机",
        search: false,
    },
    halt: {
        title: "停机",
        search: false,
    },
    other: {
        title: "其他",
        search: false,
    },
}
const service = createApi("outbound/call_record_statistics", schema, null, "")
service.get = async (args) => {
    if (args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        args.begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        args.end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
    }
    let data = await createApi(
        "outbound/call_record_statistics",
        schema,
        null,
        ""
    ).get(args)
    return data
}

export default {
    schema,
    service,
}
