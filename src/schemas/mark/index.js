import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker } from "antd"
import moment from "moment"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

const schema = {
    create_time: {
        title: "时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
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
            ready: {
                value: "0",
                remark: "准备中",
            },
            end: {
                value: 1,
                remark: "已处理",
            },
            deny: {
                value: 2,
                remark: "已放弃",
            },
        },
        required: true,
        type: schemaFieldType.Select,
    },
    project_id: {
        title: "问题库",
        style: { width: "500px" },
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },

    question_standard: {
        title: "标准问",
        searchPrefix: "like",
        sorter: true,
        style: { width: "500px" },
        required: true,
    },

    text: {
        title: "补充扩展问",
        style: { width: "500px" },
        sorter: true,
        type: schemaFieldType.TextArea,
    },
}

const service = createApi("question_mark_task", schema, null, "eq.")

service.get = async (args) => {
    if (args.create_time) {
        console.log(args.create_time.split(","))
        let beginTime = moment(args.create_time.split(",")[0]).format(
            "YYYY-MM-DD"
        )
        let endTime = moment(args.create_time.split(",")[1]).format(
            "YYYY-MM-DD"
        )
        args.create_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
    }
    let data = await createApi("question_mark_task", schema, null, "eq.").get(
        args
    )
    let list = data.list.map((item, index) => {
        return {
            ...item,
            text: item.info && item.info.text,
            question_standard: item.info && item.info.question_standard,
        }
    })
    return { ...data, list }
}

service.delete = async (args) => {
    let data = await createApi("question_mark_task", schema, null, "").patch({
        id: "in.(" + args.id + ")",
        status: 2,
    })
    return { ...data, msg: "放弃成功" }
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
    return { ...data, msg: "同步执行中!" }
}
export default {
    schema,
    service,
}
