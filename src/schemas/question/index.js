import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    id: {
        title: "编号",
        sorter: true,
        addHide: true,
        readOnly: true
    },
    group: {
        title: "分组",
        required: true,
        sorter: true
    },
    label: {
        title: "标签",
        type: schemaFieldType.Select,
        props: {
            mode: "tags"
        }
    },
    question_standard: {
        title: "标准问",
        required: true,
        type: schemaFieldType.TextArea,
        sorter: true
    },
    answer: {
        title: "答案",
        required: true,
        type: schemaFieldType.TextArea
    },
    question_extend: {
        title: "扩展问",
        type: schemaFieldType.Select,
        exportConcat: true,
        props: {
            mode: "tags"
        }
    }
}

const service = createApi("question", schema, ".eq")
service.search = createApi("rpc/question_search", schema).getBasic

export default {
    schema,
    service
}
