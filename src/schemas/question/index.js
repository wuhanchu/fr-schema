import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    id: {
        title: "编号",
        sorter: true,
        addHide: true,
        editHide: true,
        readOnly: true,
    },

    question_standard: {
        title: "标准问",
        required: true,
        searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        itemProps: {
            labelCol: { span: 4 },
        },
        sorter: true,
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        listHide: true,
        exportConcat: true,
        extra: "每行表示一个问题",
        itemProps: {
            labelCol: { span: 4 },
        },
    },

    group: {
        title: "分组",
        searchPrefix: "like",
        itemProps: {
            labelCol: { span: 4 },
        },
        // required: true,
        sorter: true,
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
        itemProps: {
            labelCol: { span: 4 },
        },
    },

    answer: {
        title: "答案",
        required: true,
        listHide: true,
        type: schemaFieldType.BraftEditor,
        lineWidth: "580px",
        props: {
            style: {
                height: "350px",
                border: "1px solid #d9d9d9",
                overflow: "hidden",
            },
            controls: [
                "undo",
                "redo",
                "separator",
                "font-size",
                "line-height",
                "letter-spacing",
                "text-color",
                "bold",
                "italic",
                "underline",
                "text-indent",
                "text-align",
                "list-ul",
                "list-ol",
                "blockquote",
                "code",
                "separator",
                "link",
                {
                    key: "fullscreen",
                    text: <b>全屏</b>,
                },
            ],
        },
        itemProps: {
            labelCol: { span: 4 },
        },
    },
}

const service = createApi("question", schema, null, "eq.")
service.get = async function (args) {
    const res = await createApi("question", schema, null, "eq.").get(args)
    let list = res.list.map((item) => {
        console.log({
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
        })
        return {
            ...item,
            question_extend: item.question_extend
                ? item.question_extend.join("\n")
                : null,
        }
    })
    return { ...res, list: list }
}
service.post = async function (args) {
    let question_extend = null
    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").post({
        ...args,
        question_extend: question_extend,
    })

    return res
}
service.patch = async function (args) {
    let question_extend = null
    if (args.question_extend) {
        question_extend = args.question_extend.split("\n")
    }
    const res = await createApi("question", schema, null, "eq.").patch({
        ...args,
        question_extend: question_extend,
    })

    return res
}
service.search = createApi("rpc/question_search", schema).getBasic

export default {
    schema,
    service,
}
