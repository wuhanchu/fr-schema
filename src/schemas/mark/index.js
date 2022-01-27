import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker } from "antd"
import moment from "moment"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

const schema = {
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
    project_id: {
        title: "问题库",
        style: { width: "500px" },
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        required: true,
    },

    question_standard: {
        title: "标准问",
        searchPrefix: "like",
        style: { width: "500px" },
        required: true,
        sorter: true,
        search: false,
    },

    text: {
        title: "补充扩展问",
        search: false,
        style: { width: "500px" },
        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("question_mark_task", schema, null, "eq.")

service.getRepeat = async (args) => {
    console.log(args)
    if (args.flitter_time) {
        let beginTime = args.flitter_time[0].format("YYYY-MM-DD")
        let endTime = args.flitter_time[1].format("YYYY-MM-DD")
        // args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
        args.begin_time = beginTime + "T00:00:00"
        // args.begin_time = args.create_time.split(",")[0]
        args.end_time = endTime + "T23:59:59"
        // args.end_time = args.create_time.split(",")[1]
        args.flitter_time = undefined
    }

    let order = args.order

    if (order) {
        if (
            args.order.split(".")[0] === "calibration_question_text" ||
            args.order.split(".")[0] === "compare_question_text" ||
            args.order.split(".")[0] === "compatibility"
        ) {
            args.order = "info->>'" + order.split(".")[0] + "'"
        } else {
            args.order = order.split(".")[0]
        }
        args.sort = order.split(".")[1]
    } else {
        args.order = "create_time"
        args.sort = "desc"
    }
    let data = await createApi(
        "question/mark_task/merge_question",
        schema,
        null,
        ""
    ).get({
        ...args,
        type: undefined,
        notNullsLast: true,
    })
    let list = data.list.map((item, index) => {
        return {
            ...item.info,
            ...item,
            disabled: item.status !== "wait",
            text: item.info && item.info.text,
            question_standard: item.info && item.info.question_standard,
        }
    })
    console.log(data)
    return { ...data, list }
}

service.get = async (args) => {
    if (args.flitter_time) {
        // console.log(args.create_time.split(","))
        let beginTime = args.flitter_time[0].format("YYYY-MM-DD") + "T00:00:00"
        let endTime = args.flitter_time[1].format("YYYY-MM-DD") + "T23:59:59"
        args.flitter_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
    }

    if (args.order === "question_standard.desc") {
        args.order = "info->question_standard.desc"
    }
    if (args.order === "question_standard.asc") {
        args.order = "info->question_standard.asc"
    }
    if (args.order === "text.desc") {
        args.order = "info->text.desc"
    }
    if (args.order === "text.asc") {
        args.order = "info->text.asc"
    }
    // order: 'info->question_standard.desc'
    let data = await createApi("question_mark_task", schema, null, "eq.").get({
        ...args,
    })
    let list = data.list.map((item, index) => {
        return {
            ...item.info,
            ...item,
            disabled: item.status !== "wait",

            text: item.info && item.info.text,
            question_standard: item.info && item.info.question_standard,
        }
    })
    return { ...data, list }
}

service.delete = async (args) => {
    if (args.id) {
        let data = await createApi(
            "question_mark_task",
            schema,
            null,
            ""
        ).patch({
            id: "in.(" + args.id + ")",
            status: "deny",
        })
        return { ...data, msg: "丢弃成功" }
    }
    return { msg: "没有可丢弃的数据!" }
}
service.append = async (args) => {
    let data = await createApi(
        "question/mark_additional",
        schema,
        null,
        "eq."
    ).patch(args)
    return { ...data, msg: "补充成功" }
}

service.mark_task = async (args) => {
    let data = await createApi("mark_task", schema, null, "eq.").post(args)
    return { ...data }
}
export default {
    schema,
    service,
}
