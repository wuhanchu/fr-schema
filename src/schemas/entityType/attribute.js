import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { truncate } from "lodash"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        addHide: true,
        editHide: true,
        required: true,
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

const service = createApi("entity_type_attribute", schema, null, "eq.")

export default {
    schema,
    service,
}
