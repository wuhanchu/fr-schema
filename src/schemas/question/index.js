import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import projectService from "./../project"
import moment from "moment"
import { Tooltip } from "antd"

const Minio = require("minio")

const schema = {
    group: {
        // title: "分组",
        title: <div style={{ width: "56px" }}>分组</div>,

        type: schemaFieldType.Select,

        searchPrefix: "like",
        // required: true,
        render: (data, item) => {
            return item.group
        },
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,
        editable: true,
        fixed: "left",
        width: "250px",
    },
    question_standard: {
        title: <div style={{ width: "56px" }}>标准问</div>,

        required: true,
        // searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 2, maxRows: 6 },
            placeholder: "请输入标准问",
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
    question_extend_number: {
        title: "扩展问数量",
        editHide: true,
        width: "120px",
        addHide: true,
        showHide: true,
    },
    // recommend_text: {
    //     title: <div style={{ width: "56px" }}>推荐问</div>,
    //     // type: schemaFieldType.Select,
    //     type: schemaFieldType.TextArea,
    //     props: {
    //         autoSize: { minRows: 2, maxRows: 6 },
    //         placeholder: "请输入推荐问",
    //     },
    //     exportConcat: true,
    //     extra: "每行表示一个问题",
    //     editable: true,
    //     render: (item, record) => {
    //         let showContent = item ? item : null
    //         return (
    //             <Tooltip
    //                 title={
    //                     <div
    //                         dangerouslySetInnerHTML={{ __html: showContent }}
    //                     />
    //                 }
    //             >
    //                 {item && item.length > 20
    //                     ? item.substring(0, 20) + "..."
    //                     : item}
    //             </Tooltip>
    //         )
    //     },
    //     width: "260px",
    // },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
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
        hideInTable: true,
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
                "table",

                "text-color",
                "bold",
                "italic",
                "media",
                "blockquote",
                "code",
                "link",
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
        showHide: true,
        render: (item) => {
            return item ? (
                <div style={{ minWidth: "300px" }}>{item}</div>
            ) : (
                <div></div>
            )
        },
        width: "120px",
    },
    create_time: {
        title: "创建时间",
        addHide: true,
        showHide: true,

        editHide: true,
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        width: "135px",
    },
    update_time: {
        title: "更新时间",
        addHide: true,
        showHide: true,
        editHide: true,
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            valueType: "dateTime",
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

    console.log("orStr")
    const res = await createApi("question", schema, null, null).get(args)
    let list = res.list.map((item) => {
        return {
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
            recommend_text: item.recommend_text
                ? item.recommend_text.join("\n")
                : null,
            ...item.info,
            info: item.info ? JSON.stringify(item.info) : "",
        }
    })
    return { ...res, list: list }
}

service.getData = async function (args) {
    console.log(args)
    let questionExtendArgs = {}
    if (args.create_time && !args.update_time) {
        let beginTime =
            moment(args.create_time.split(",")[0]).format("YYYY-MM-DD") +
            "T00:00:00"
        let endTime =
            moment(args.create_time.split(",")[1]).format("YYYY-MM-DD") +
            "T23:59:59"
        args.create_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
        questionExtendArgs.create_time_begin = beginTime
        questionExtendArgs.create_time_end = endTime
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
        questionExtendArgs.update_time_begin = beginTime
        questionExtendArgs.update_time_end = endTime
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
        questionExtendArgs.create_time_begin = createBeginTime
        questionExtendArgs.create_time_end = createEndTime
        questionExtendArgs.update_time_begin = updateBeginTime
        questionExtendArgs.update_time_end = updateEndTime
    }

    let question_standardList = []

    if (args.question_standard) {
        args.question_standard.split(" ").map((item) => {
            question_standardList.push("question_standard.like.*" + item + "*")
        })
        args.question_standard = undefined
    }

    if (args.answer) {
        args.answer.split(" ").map((item) => {
            question_standardList.push("answer.like.*" + item + "*")
        })
        args.answer = undefined
    }

    let orStr = question_standardList.length
        ? "(" + question_standardList.join(",") + ")"
        : undefined
    args.or = orStr
    const res = await createApi(
        "question",
        schema,
        {
            headers: {
                Prefer: "count=exact",
                "Count-Question-Extend": true,
            },
        },
        null
    ).get(args)

    let list = res.list.map((item) => {
        return {
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
            ...item.info,
            recommend_text: item.recommend_text
                ? item.recommend_text.join("\n")
                : null,
            info: item.info ? JSON.stringify(item.info) : "",
        }
    })
    return {
        ...res,
        list: list,
        question_extend_count: res.other.headers.get("question-extend-count"),
    }
}
service.getMinioConfig = async function (args) {
    const res = await createApi("minio", schema, null, "").get(args)
    return res
}
service.post = async function (args, schema) {
    let question_extend = null
    let recommend_text = undefined

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
    if (args.recommend_text) {
        recommend_text = args.recommend_text.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").post({
        ...args,
        question_extend: question_extend,
        recommend_text: recommend_text,
    })

    return res
}
service.patch = async function (args, schema) {
    let question_extend = args.question_extend
    let recommend_text = args.recommend_text ? args.recommend_text : undefined

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
    if (args.recommend_text && typeof args.recommend_text === "string") {
        recommend_text = args.recommend_text.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").patch({
        ...args,
        question_extend: question_extend || null,
        recommend_text: recommend_text || undefined,
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
        recommend_text: res.recommend_text
            ? res.recommend_text.join("\n")
            : null,
        answer: res.answer && res.answer.replace(/\n/g, "<br>"),
    }
}
service.getDetails = async function (args) {
    const res = await createApi("question", schema, null, "").get(args)
    return {
        ...res,
    }
}

service.matchDel = async (args) => {
    console.log("结果", args)
    const res = await createApi(
        "question?external_id=in.(" + args.external_id.replace("\n", ",") + ")",
        schema,
        null,
        ""
    ).delete({})
}

service.compare = async function (args) {
    const res = await createApi("search/compare", schema, null, "").get(args)
    return {
        ...res,
    }
}

export default {
    schema,
    service,
}
