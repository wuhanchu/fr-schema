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
    from_entity_type_name: {
        title: "左实体类型",
        editHide: true,
        search: false,
        addHide: true,
    },
    from_entity_type_id: {
        title: "左实体类型",
        type: schemaFieldType.Select,
        hideInTable: true,
        editHide: true,
        addHide: true,
    },
    from_entity_name: {
        title: "左实体",
        editHide: true,
        addHide: true,
        search: false,
        required: true,
    },
    from_entity_id: {
        title: "左实体",
        type: schemaFieldType.Select,
        hideInTable: true,
        sorter: true,
        required: true,
    },

    relation_key: {
        title: "关系",
        type: schemaFieldType.Select,
        sorter: true,
        editable: true,
        required: true,
    },
    to_entity_type_name: {
        title: "右实体类型",
        editHide: true,
        search: false,

        addHide: true,
    },
    to_entity_type_id: {
        type: schemaFieldType.Select,
        title: "右实体类型",
        hideInTable: true,
        editHide: true,
        addHide: true,
    },
    to_entity_name: {
        title: "右实体",
        editHide: true,
        addHide: true,
        search: false,

        required: true,
    },

    to_entity_id: {
        title: "右实体",
        hideInTable: true,
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },

    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        search: false,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },

    attribute: {
        title: "属性",
        search: false,
        hideInTable: true,
        props: {
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
