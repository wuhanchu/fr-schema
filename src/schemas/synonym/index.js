import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        type: schemaFieldType.Select,
    },
    standard_text: {
        title: "标准文本",
        sorter: true,
        searchPrefix: "like",
        required: true,
    },

    exntend_text: {
        title: "扩展文本",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
    },
}

const service = createApi("synonym", schema, null, "eq.")

export default {
    schema,
    service,
}
