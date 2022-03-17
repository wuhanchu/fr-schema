import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        // required: true,
        addHide: true,
        editHide: true,
        search: false,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    standard_text: {
        title: "标准文本",
        sorter: true,
        searchPrefix: "like",
        required: true,
    },

    extend_text: {
        title: "扩展文本",
        sorter: true,
        type: schemaFieldType.Select,

        search: false,
        props: {
            allowClear: true,
            showSearch: true,
            mode: "tags",
            dropdownRender: false,
            dropdownStyle: { zIndex: -999 },
        },
    },
}

const service = createApi("synonym", schema, null, "eq.")
service.upInsert = createApi(
    "synonym?on_conflict=domain_key,standard_text",
    schema,
    null,
    "eq."
).upInsert
export default {
    schema,
    service,
}
