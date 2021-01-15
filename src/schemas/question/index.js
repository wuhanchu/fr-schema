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
    group: {
        title: "分组",
        searchPrefix: "like",

        required: true,
        sorter: true,
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
    },
    question_standard: {
        title: "标准问",
        required: true,
        searchPrefix: "like",
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        sorter: true,
    },
    question_extend: {
        title: "扩展问",
        type: schemaFieldType.Select,
        listHide: true,
        exportConcat: true,
        props: {
            mode: "tags",
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
        },
    },
}

const service = createApi("question", schema, null, "eq.")
service.search = createApi("rpc/question_search", schema).getBasic

export default {
    schema,
    service,
}
