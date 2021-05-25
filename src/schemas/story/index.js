import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
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

    remark: {
        title: "备注",
        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("story", schema, null, "eq.")

export default {
    schema,
    service,
}
