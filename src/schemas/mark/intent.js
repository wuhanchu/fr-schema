import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker } from "antd"
import moment from "moment"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

const schema = {
    domain_key: {
        title: "域",
        search: false,
        type: schemaFieldType.Select,
    },
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
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
            style: { width: "100%" },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
    },

    create_time: {
        title: "时间",
        required: true,
        // search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        search: false,
        props: {
            // showTime: true,
            // valueType: "dateTime",
            // valueType: 'dateRange',
        },
        renderInput: () => <RangePicker style={{ width: "100%" }} />,
        type: schemaFieldType.DatePicker,
    },
    status: {
        title: "状态",
        sorter: true,
        addHide: true,
        editHide: true,
        dict: {
            wait: {
                value: "wait",
                remark: "未处理",
            },
            end: {
                value: "end",
                remark: "已处理",
            },
            deny: {
                value: "deny",
                remark: "已丢弃",
            },
        },
        required: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    type: {
        title: "类型",
        type: schemaFieldType.Select,
        dict: {
            merge_intent: {
                value: "merge_intent",
                remark: "表达式冲突",
            },
            merge_standard_discourse: {
                value: "merge_standard_discourse",
                remark: "话术冲突",
            },
        },
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },
    calibration_intent_text: {
        title: "检测重复文本",
        search: false,
        sorter: true,
    },
    compare_intent_text: {
        title: "对比重复文本",
        search: false,
        sorter: true,
    },
    // project_id: {
    //     title: "问题库",
    //     // style: { width: "500px" },
    //     type: schemaFieldType.Select,
    //     props: {
    //         allowClear: true,
    //         showSearch: true,
    //     },
    //     sorter: true,
    //     required: true,
    // },

    regex: {
        title: "重复表达式",
        search: false,
        sorter: true,
    },
    intent_id: {
        title: "意图",
        search: false,
        type: schemaFieldType.Select,
        hideInTable: true,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },
    calibration_intent_id: {
        title: "检测意图",
        type: schemaFieldType.Select,
        search: false,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },
    compare_intent_id: {
        title: "对比意图",
        search: false,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },
}

const service = createApi("intent_mark_task", schema, null, "eq.")

service.get = async (args) => {
    let order = args.order
    if (args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        let begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
        args.and = `(create_time.gte.${begin_time})`
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        let end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
        args.and = `(create_time.lte.${end_time})`
    }
    if (args.end_time && args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        let begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
        time = new Date(parseInt(args.end_time))
        let end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
        args.and = `(create_time.gte.${begin_time},create_time.lte.${end_time})`
    }
    args.end_time = undefined
    args.begin_time = undefined
    if (order) {
        if (
            args.order.split(".")[0] === "compare_intent_id" ||
            args.order.split(".")[0] === "calibration_intent_id" ||
            args.order.split(".")[0] === "calibration_intent_text" ||
            args.order.split(".")[0] === "compare_intent_text" ||
            args.order.split(".")[0] === "regex"
        ) {
            args.order =
                "info->>" + order.split(".")[0] + "." + order.split(".")[1]
        } else {
            args.order = order.split(".")[0] + "." + order.split(".")[1]
        }
        // args.sort = order.split(".")[1]
    } else {
        args.order = "create_time.desc"
        // args.sort = "desc"
    }
    // order: 'info->question_standard.desc'
    let data = await createApi("intent_mark_task", schema, null, "eq.").get({
        ...args,
    })
    let list = data.list.map((item, index) => {
        return {
            ...item.info,
            ...item,
            disabled: item.status !== "wait",
        }
    })
    return { ...data, list }
}

service.deny = async (args) => {
    if (args.id) {
        let data = await createApi("intent_mark_task", schema, null, "").patch({
            id: "in.(" + args.id + ")",
            status: "deny",
        })
        return { ...data, msg: "丢弃成功" }
    }
    return { msg: "没有可丢弃的数据!" }
}

export default {
    schema,
    service,
}
