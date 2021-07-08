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
        title: "左实体",
        editHide: true,
        addHide: true,
        required: true,
    },
    from_entity_id: {
        title: "左实体",
        type: schemaFieldType.Select,
        listHide: true,
        sorter: true,
        required: true,
    },
    from_entity_type_name: {
        title: "左实体类型",
        editHide: true,
        addHide: true,
    },

    relation_key: {
        title: "关系",
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },

    to_entity_name: {
        title: "右实体",
        editHide: true,
        addHide: true,
        required: true,
    },

    to_entity_id: {
        title: "右实体",
        listHide: true,
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },
    to_entity_type_name: {
        title: "右实体类型",
        editHide: true,
        addHide: true,
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
