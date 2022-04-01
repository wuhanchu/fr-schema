import { createApi, createBasicApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import projectService from "./../project"
import moment from "moment"
import { Tooltip, DatePicker } from "antd"
// import { RangePicker } from "antd";
const Minio = require("minio")
const { RangePicker } = DatePicker
const schema = {
    question_standard: {
        title: "标准问句",
        before: true,
        required: true,
        // searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 5, maxRows: 5 },
            placeholder: "请输入标准问句",
        },
        sorter: true,
        editable: true,
        // width: "260px",
        fixed: "left",
    },
    group: {
        // title: "分组",
        title: <div style={{ width: "56px" }}>分组</div>,
        before: true,

        type: schemaFieldType.Select,

        searchPrefix: "like",
        // required: true,
        render: (data, item) => {
            return item.group
        },
        props: {
            allowClear: true,
            showSearch: true,
            style: { minWidth: "150px" },
        },
        sorter: true,
        editable: true,
        minWidth: "150px",
    },
    label: {
        title: "标签",
        // searchPrefix: "like",
        before: true,

        type: schemaFieldType.Select,
        // sorter: true,

        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
        editable: true,
        width: "120px",
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        before: true,

        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 6, maxRows: 6 },
            placeholder: "请输入扩展问",
        },
        style: {
            height: "100px",
            width: "300px",
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
    question_extend_count: {
        title: "扩展问数量",
        editHide: true,
        sorter: true,
        before: true,

        width: "100px",
        addHide: true,
        showHide: true,
    },

    global_key: {
        title: "内部编号",
        sorter: true,
        before: true,
        props: {
            placeholder: "请输入",
        },
        extra: "作为对话机器人的匹配主键",
        editable: true,
        render: (item) => {
            return <div style={{ minWidth: "60px" }}>{item}</div>
        },
        width: "80px",
    },
    external_id: {
        title: "外部编号",
        addHide: true,
        sorter: true,

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
    answer: {
        title: "答案内容",
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
        listHide: true,
        // width: 450,
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
                        style={{
                            maxHeight: "40px",
                            overflow: "hidden",
                            maxWidth: "450px",
                        }}
                        dangerouslySetInnerHTML={{ __html: item }}
                    />
                </Tooltip>
            )
        },
        props: {
            style: {
                height: "324px",
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
    answer_text: {
        title: "概要",
        position: "right",
        style: { width: "530px" },
        type: schemaFieldType.TextArea,
        props: {
            // 最小高度
            autoSize: { minRows: 2, maxRows: 2 },
        },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        listHide: true,
        editable: true,
        // width: "250px",
    },
    recommend_text: {
        title: <div style={{ width: "56px" }}>推荐信息</div>,
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 2 },
            placeholder: "请输入推荐信息",
        },
        style: { width: "530px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        position: "right",
        exportConcat: true,
        extra: "每行表示一个问题",
        listHide: true,
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
        // width: "260px",
    },

    create_time: {
        title: "创建时间",

        addHide: true,
        showHide: true,
        sorter: true,

        editHide: true,
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        renderInput: () => {
            return (
                <RangePicker
                    allowEmpty={[true, true]}
                    format="MM-DD HH:mm:ss"
                    showTime
                ></RangePicker>
            )
        },
        // width: "135px",
    },
    update_time: {
        title: "更新时间",
        sorter: true,

        addHide: true,
        showHide: true,
        editHide: true,
        type: schemaFieldType.DatePicker,
        props: {
            showTime: true,
            valueType: "dateTime",
            allowEmpty: [true, true],
            format: "MM-DD HH:mm:ss",
        },
        // width: "135px",
    },
}

const service = createApi("question", schema, null, "eq.")
service.get = async function (args) {
    let andArray = []
    if (args.create_time) {
        if (args.create_time.split(",")[0]) {
            andArray.push(
                `create_time.gte.${
                    moment(args.create_time.split(",")[0]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
        if (args.create_time.split(",")[1]) {
            andArray.push(
                `create_time.lte.${
                    moment(args.create_time.split(",")[1]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
    }
    if (args.update_time) {
        if (args.update_time.split(",")[0]) {
            andArray.push(
                `update_time.gte.${
                    moment(args.update_time.split(",")[0]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
        if (args.update_time.split(",")[1]) {
            andArray.push(
                `update_time.lte.${
                    moment(args.update_time.split(",")[1]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
    }

    args.create_time = undefined
    args.update_time = undefined
    args.and = andArray.length ? "(" + andArray.join(",") + ")" : undefined

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
    let andArray = []
    if (args.create_time) {
        if (args.create_time.split(",")[0]) {
            andArray.push(
                `create_time.gte.${
                    moment(args.create_time.split(",")[0]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
        if (args.create_time.split(",")[1]) {
            andArray.push(
                `create_time.lte.${
                    moment(args.create_time.split(",")[1]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
    }
    if (args.update_time) {
        if (args.update_time.split(",")[0]) {
            andArray.push(
                `update_time.gte.${
                    moment(args.update_time.split(",")[0]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
        if (args.update_time.split(",")[1]) {
            andArray.push(
                `update_time.lte.${
                    moment(args.update_time.split(",")[1]).format(
                        "YYYY-MM-DD"
                    ) + "T00:00:00"
                }`
            )
        }
    }

    args.create_time = undefined
    args.update_time = undefined
    args.and = andArray.length ? "(" + andArray.join(",") + ")" : undefined

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
        "question_query_view",
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
service.getGroup = async function (args) {
    const res = await createApi("question", schema, null, "").get(args)
    return res
}
service.getMinioConfig = async function (args) {
    const res = await createApi("minio", schema, null, "").get(args)
    return res
}
service.post = async function (args, schema) {
    let question_extend = null
    let recommend_text = null

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
    let recommend_text = args.recommend_text

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
        recommend_text: recommend_text || null,
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
