import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        addHide: true,
        editHide: true,
        required: true,
        type: schemaFieldType.Select,
    },

    from_entity_name: {
        title: "父实体",
        style: { width: "500px" },
        sorter: true,
        required: true,
    },

    to_entity_name: {
        title: "子实体",
        style: { width: "500px" },
        sorter: true,
        required: true,
    },

    type: {
        title: "类型",
        style: { width: "500px" },
        sorter: true,
        required: true,
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

    attribute: {
        title: "属性",
        listHide: true,
        props: {
            style: { width: "500px" },
            height: "300px",
        },
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
}

const service = createApi("relation", schema, null, "eq.")

export default {
    schema,
    service,
}
