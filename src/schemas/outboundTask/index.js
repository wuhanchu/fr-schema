import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import moment from "moment"

const schema = {
    start_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        extra: "任务开始拨号时间",
        hideInTable: true,
        required: true,
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        extra: "任务结束拨号时间",
        hideInTable: true,
        required: true,
    },
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
    caller_group_id: {
        title: "号码组",
        hideInTable: true,
        search: false,
        required: true,
        type: schemaFieldType.Select,
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
            true: { value: "true", remark: "是" },
            false: { value: "false", remark: "否" },
        },
        extra: "是否为测试任务",
    },
    caller_number: {
        title: "呼出号码",
        type: schemaFieldType.Select,
    },
    user_id: {
        title: "用户",
        addHide: true,
    },
    status: {
        title: "状态",
        addHide: true,
        editHide: true,
        type: schemaFieldType.Select,
        dict: {
            wait: { value: "wait", remark: "等待运行" },
            running: { value: "running", remark: "运行中" },
            suspend: { value: "suspend", remark: "暂停" },
            end: { value: "end", remark: "结束" },
        },
    },

    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },
}

const importSchema = {
    // call_type: {
    //     title: "数据类型",
    //     type: schemaFieldType.Select,
    //     required: true,

    //     dict: {
    //         predict: {
    //             value: "3",
    //             remark: "预测外呼",
    //         },
    //         auto: {
    //             value: "4",
    //             remark: "自动外呼",
    //         },
    //     },
    // },
    // service_cmd: {
    //     title: "接听队列",
    //     type: schemaFieldType.Select,
    //     required: true,

    //     dict: {
    //         预测004: {
    //             value: "预测004",
    //             remark: "预测004",
    //         },
    //         预测006: {
    //             value: "预测006",
    //             reamrk: "预测006",
    //         },
    //     },
    // },
    name: {
        title: "名称",
        required: true,
    },

    // call_modle: {
    //     required: true,

    //     title: "外呼模式",
    //     type: schemaFieldType.Select,
    //     dict: {
    //         return: {
    //             value: "0",
    //             remark: "接通转坐席",
    //         },
    //     },
    // },
    number_group: {
        title: "数据文件",
        required: true,
        type: schemaFieldType.Upload,
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
service.getDict = async (args) => {
    return createApi("outbound/dictionary", schema, null, "").getBasic(args)
}
service.post = async (args) => {
    if (args.start_time) {
        args.start_time = moment(args.start_time).format("YYYY-MM-DD")
    }
    if (args.end_time) {
        args.end_time = moment(args.end_time).format("YYYY-MM-DD")
    }
    console.log(args)
    let data = await createApi("outbound/create_task", null, null, "").post({
        ...args,
        flow_id: "12085",
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
    ).post({ ...args })
    return data
}
export default {
    schema,
    service,
    importSchema,
    fileSchema,
}
