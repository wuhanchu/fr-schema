import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        style: { width: "500px" },
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        style: { width: "500px" },
        searchPrefix: "like",
        sorter: true,
        required: true,
    },

    example: {
        title: "例子",
        sorter: true,
        style: { width: "500px" },
        required: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            dropdownRender: false,
            dropdownStyle: { zIndex: -999 },
        },
    },

    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("intent", schema, null, "eq.")

export default {
    schema,
    service,
}
