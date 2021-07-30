import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import moments from "moment"

const schema = {
    id: {
        title: "编号",
        sorter: true,
    },
    search: {
        title: "搜索内容",
    },

    match_question_txt: {
        title: "匹配文本",
        required: true,
        searchPrefix: "like",
        sorter: true,
    },
}

const service = createApi("search_history", schema, null)

export default {
    schema,
    service,
}
