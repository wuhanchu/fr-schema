import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { truncate } from "lodash"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        addHide: true,
        editHide: true,
        search: false,
        // required: true,
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        searchPrefix: "like",
        sorter: true,
        required: true,
    },

    key: {
        title: "编码",
        searchPrefix: "like",
        sorter: true,
        required: true,
    },

    alias: {
        title: "是否别名",
        searchPrefix: "like",
        search: false,
        type: schemaFieldType.Select,
        dict: {
            true: {
                value: true,
                remark: "是",
            },
            false: {
                value: false,
                remark: "否",
            },
        },
        sorter: true,
    },
    depend_on: {
        title: "依赖字段",
        search: false,

        // addHide: true,
        // editHide: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
    },

    create_time: {
        title: "创建时间",
        search: false,
        // required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("entity_type_attribute", schema, null, "eq.")
service.upInsert = createApi(
    "entity_type_attribute?on_conflict=domain_key,entity_type_key,key",
    schema,
    null,
    "eq."
).upInsert
export default {
    schema,
    service,
}
