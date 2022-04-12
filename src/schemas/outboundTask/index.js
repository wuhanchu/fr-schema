import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import moment from "moment"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        addHide: true,
        editHide: true,
        required: true,
        type: schemaFieldType.Select,
        search: false,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
        required: true,
    },

    flow_key: {
        title: "流程",
        required: true,
        type: schemaFieldType.Select,
    },
    test: {
        title: "测试任务",
        type: schemaFieldType.Select,
        required: true,
        dict: {
            true: {
                value: "true",
                remark: "是",
            },
            false: {
                value: "false",
                remark: "否",
            },
        },
        extra: "是否为测试任务，测试任务不加入统计",
    },

    user_id: {
        title: "操作用户",
        type: schemaFieldType.Select,
        addHide: true,
    },
    status: {
        title: "状态",
        addHide: true,
        editHide: true,
        type: schemaFieldType.Select,
        dict: {
            wait: {
                value: "wait",
                remark: "等待运行",
            },
            running: {
                value: "running",
                remark: "运行中",
            },
            suspend: {
                value: "suspend",
                remark: "暂停",
            },
            end: {
                value: "end",
                remark: "结束",
            },
        },
    },
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        extra: "任务开始时间为选择日期当天00:00:00",
        // hideInTable: true,
        search: false,
        required: true,
        render: (item, data) => {
            if (data.begin_time)
                return moment(data.begin_time).format("YYYY-MM-DD")
            else {
                return "-"
            }
        },
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        extra: "任务结束时间为选择日期当天23.59:59",
        // hideInTable: true,
        search: false,
        render: (item, data) => {
            if (data.end_time)
                return moment(data.end_time)
                    .subtract("day", 1)
                    .format("YYYY-MM-DD")
            else {
                return "-"
            }
        },
        required: true,
    },
    caller_group_id: {
        title: "号码组",
        // hideInTable: true,
        // search: false,
        required: true,
        type: schemaFieldType.Select,
    },
    caller_number: {
        title: "呼出号码",
        search: false,
        // required: true,
        extra: "呼出号码可以为空，不选按组随机",
        type: schemaFieldType.Select,
    },
    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        render: (item, data) => {
            if (data.create_time)
                return moment(data.create_time).format("YYYY-MM-DD HH:mm:ss")
            else {
                return "-"
            }
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },
}

const statisticsSchema = {
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
    flow_key: {
        title: "流程",
        required: true,
        hideInTable: true,
        search: false,
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
        search: false,
        title: "渠道",
        hideInTable: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
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

const importSchema = {
    number_group: {
        title: "数据文件",
        props: {
            style: {
                width: "300px",
            },
        },
        required: true,
        type: schemaFieldType.Upload,
    },

    name: {
        title: "批次名称",
        // required: true,
    },
}

const fileSchema = {
    phone: {
        title: "电话号码",
        required: true,
    },
    slot: {
        title: "槽位",
    },
    custname: {
        title: "客户名称",
    },
    index_no: {
        title: "外部索引号",
    },
    cstm_param: {
        title: "自定义参数",
    },
    auto_maxtimes: {
        title: "自动重拨次数",
    },
    othermsg: {
        title: "自定义字段",
    },
}

const service = createApi("outbound_task", schema, null, "eq.")
service.getStatistics = async (args) => {
    if (args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        args.begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        args.end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
    }
    let data = await createApi(
        "outbound/call_record_summary",
        schema,
        null,
        ""
    ).getBasic(args)
    return {
        ...data,
        list: [data.list],
        summary: data.list,
    }
}
service.getDict = async (args) => {
    return createApi("outbound/dictionary", schema, null, "").getBasic(args)
}
service.post = async (args) => {
    if (args.begin_time) {
        args.begin_time = moment(args.begin_time).format("YYYY-MM-DD")
    }
    if (args.end_time) {
        args.end_time = moment(args.end_time)
            .add("days", 1)
            .format("YYYY-MM-DD")
    }
    let data = await createApi("outbound/create_task", null, null, "").post({
        ...args,
    })
    return data
}
// /outbound/import_data
service.importData = async (args) => {
    let data = await createApi("outbound/import_data", null, null, "").post({
        ...args,
    })
    return data
}
service.importData = async (args) => {
    let data = await createApi("outbound/import_data", null, null, "").post({
        ...args,
    })
    return data
}

service.changeTaskStatus = async (args) => {
    let data = await createApi(
        "outbound/change_task_status",
        null,
        null,
        ""
    ).post({
        ...args,
    })
    return data
}
service.syncTaskResult = async (args) => {
    let data = await createApi(
        "outbound/sync_task_result",
        null,
        null,
        ""
    ).post({
        ...args,
    })
    return data
}
export default {
    schema,
    service,
    importSchema,
    fileSchema,
    statisticsSchema,
}
