import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import projectService from "./../project"
import moment from "moment"
import { Tooltip } from "antd"

const Minio = require("minio")

const schema = {
    group: {
        title: "分组",
        type: schemaFieldType.Select,
        searchPrefix: "like",
        // required: true,
        render: (data, item) => {
            return item.group
        },
        sorter: true,
        editable: true,
        fixed: "left",
        width: "250px",
    },
    question_standard: {
        title: "标准问",
        required: true,
        searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 2, maxRows: 6 },
        },
        sorter: true,
        editable: true,
        width: "260px",
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        exportConcat: true,
        extra: "每行表示一个问题",
        editable: true,
        render: (item, record) => {
            let showContent = item ? item : null
            return (
                <Tooltip
                    title={
                        <div
                            dangerouslySetInnerHTML={{ __html: showContent }}
                        />
                    }
                >
                    {item && item.length > 20
                        ? item.substring(0, 20) + "..."
                        : item}
                </Tooltip>
            )
        },
        width: "260px",
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
        editable: true,
        width: "120px",
    },
    answer_text: {
        title: "摘要",
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 2, maxRows: 6 },
        },
        editable: true,
        width: "250px",
    },
    global_key: {
        title: "全局变量",
        extra: "作为对话机器人的匹配主键",
        editable: true,
        render: (item) => {
            return <div style={{ minWidth: "60px" }}>{item}</div>
        },
        width: "80px",
    },
    answer: {
        title: "答案",
        listHide: true,
        type: schemaFieldType.BraftEditor,
        // span: 24,
        position: "right",
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        id: "answer",
        width: 450,
        lineWidth: "480px",
        render: (item, record) => {
            return (
                <Tooltip
                    overlayInnerStyle={{ minWidth: 400 }}
                    title={
                        <div
                            style={{ maxHeight: "400px", overflowY: "auto" }}
                            dangerouslySetInnerHTML={{ __html: item }}
                        />
                    }
                >
                    <div
                        style={{ maxHeight: "40px", overflow: "hidden" }}
                        dangerouslySetInnerHTML={{ __html: item }}
                    />
                </Tooltip>
            )
        },
        props: {
            style: {
                height: "470px",
                border: "1px solid #d9d9d9",
                width: "530px",
            },
            defaultLinkTarget: "_blank",
            wrapperWidth: "900px",
            wrapperStyle: {
                marginLeft: "-34px",
                marginTop: "20px",
            },
            controls: [
                "font-size",
                "text-color",
                "bold",
                "italic",
                "media",
                "blockquote",
                "code",
                "link",
                "table",
                {
                    key: "fullscreen",
                    text: <b>全屏</b>,
                },
            ],
        },
    },
    external_id: {
        title: "外部编号",
        addHide: true,
        editHide: true,
        render: (item) => {
            return <div style={{ minWidth: "60px" }}>{item}</div>
        },
        width: "120px",
    },
    create_time: {
        title: "创建时间",
        addHide: true,
        editHide: true,
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
        },
        width: "135px",
    },
    update_time: {
        title: "更新时间",
        addHide: true,
        editHide: true,
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
        },
        width: "135px",
    },
}

const service = createApi("question", schema, null, "eq.")
service.get = async function (args) {
    if (args.create_time && !args.update_time) {
        let beginTime =
            moment(args.create_time.split(",")[0]).format("YYYY-MM-DD") +
            "T00:00:00"
        let endTime =
            moment(args.create_time.split(",")[1]).format("YYYY-MM-DD") +
            "T23:59:59"
        args.create_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
    }
    if (args.update_time && !args.create_time) {
        let beginTime =
            moment(args.update_time.split(",")[0]).format("YYYY-MM-DD") +
            "T00:00:00"
        let endTime =
            moment(args.update_time.split(",")[1]).format("YYYY-MM-DD") +
            "T23:59:59"
        args.update_time = undefined
        args.and = `(update_time.gte.${beginTime},update_time.lte.${endTime})`
    }
    if (args.update_time && args.create_time) {
        let updateBeginTime =
            moment(args.update_time.split(",")[0]).format("YYYY-MM-DD") +
            "T00:00:00"
        let updateEndTime =
            moment(args.update_time.split(",")[1]).format("YYYY-MM-DD") +
            "T23:59:59"
        args.update_time = undefined
        let createBeginTime =
            moment(args.create_time.split(",")[0]).format("YYYY-MM-DD") +
            "T00:00:00"
        let createEndTime =
            moment(args.create_time.split(",")[1]).format("YYYY-MM-DD") +
            "T23:59:59"
        args.create_time = undefined
        args.and = `(update_time.gte.${updateBeginTime},update_time.lte.${updateEndTime},create_time.gte.${createBeginTime},create_time.lte.${createEndTime})`
    }

    const res = await createApi("question", schema, null, null).get(args)
    let list = res.list.map((item) => {
        return {
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
            ...item.info,
            info: item.info ? JSON.stringify(item.info) : "",
        }
    })
    return { ...res, list: list }
}
service.getMinioConfig = async function (args) {
    const res = await createApi("minio", schema, null, "").get(args)
    return res
}
service.post = async function (args, schema) {
    let question_extend = null
    Object.keys(schema).forEach(function (key) {
        if (schema[key].isExpand) {
            if (args[key]) {
                if (args["info"]) {
                    args["info"][key] = args[key]
                } else {
                    args["info"] = {}
                    args["info"][key] = args[key]
                }
            }
            args[key] = undefined
        }
    })

    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").post({
        ...args,
        question_extend: question_extend,
    })

    return res
}
service.patch = async function (args, schema) {
    let question_extend = args.question_extend

    Object.keys(schema).forEach(function (key) {
        if (schema[key].isExpand) {
            if (args[key]) {
                if (args["info"]) {
                    args["info"][key] = args[key]
                } else {
                    args["info"] = {}
                    args["info"][key] = args[key]
                }
            }
            args[key] = undefined
        }
    })
    if (args.question_extend && typeof args.question_extend === "string") {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").patch({
        ...args,
        question_extend: question_extend || undefined,
    })

    return res
}
// service.search = createApi("rpc/question_search", schema).getBasic
service.search = createApi("search", schema).getBasic

service.uploadExcel = createBasicApi("project/import").post

service.upload = createBasicApi("file").post

service.getDetail = async function (args) {
    const res = await createApi("question", schema, null, "eq.").getDetail(args)
    return {
        ...res,
        question_extend: res.question_extend
            ? res.question_extend.join("\n")
            : null,
        ...res.info,
        info: res.info ? JSON.stringify(res.info) : "",
        answer: res.answer && res.answer.replace(/\n/g, "<br>"),
    }
}
export default {
    schema,
    service,
}
