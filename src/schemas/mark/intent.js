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
    flitter_time: {
        title: "时间",
        required: true,
        // search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateRange",
        },
        hideInTable: true,
        renderInput: () => <RangePicker style={{ width: "100%" }} />,
        type: schemaFieldType.DatePicker,
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
            showTime: true,
            valueType: "dateTime",
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
    project_id: {
        title: "问题库",
        // style: { width: "500px" },
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
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
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },
    compare_intent_id: {
        title: "对比意图",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },
    calibration_intent_id: {
        title: "检测重复文本",
    },
    compare_intent_text: {
        title: "对比重复文本",
    },
    regex: {
        title: "重复表达式",
        search: false,
    },
}

const service = createApi("intent_mark_task", schema, null, "eq.")

service.get = async (args) => {
    if (args.flitter_time) {
        // console.log(args.create_time.split(","))
        let flitter_time = args.flitter_time.split(",")
        let time = new Date(flitter_time[0])
        let beginTime = moment(time).format("YYYY-MM-DD") + "T00:00:00"
        time = new Date(flitter_time[1])
        let endTime = moment(time).format("YYYY-MM-DD") + "T23:59:59"

        // let beginTime = args.flitter_time[0].format("YYYY-MM-DD") + "T00:00:00"
        // let endTime = args.flitter_time[1].format("YYYY-MM-DD") + "T23:59:59"
        args.flitter_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
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
// service.append = async (args) => {
//     let data = await createApi(
//         "question/mark_additional",
//         schema,
//         null,
//         "eq."
//     ).patch(args)
//     return { ...data, msg: "补充成功" }
// }

// service.mark_task = async (args) => {
//     let data = await createApi("mark_task", schema, null, "eq.").post(args)
//     return { ...data }
// }
export default {
    schema,
    service,
}
