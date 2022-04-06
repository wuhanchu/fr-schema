import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        search: false,
        sorter: true,
        editHide: true,
        addHide: true,
        required: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
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

    config: {
        title: "配置",
        search: false,

        searchPrefix: "like",
        type: schemaFieldType.AceEditor,
        sorter: true,
        hideInTable: true,
    },

    create_time: {
        title: "创建时间",
        search: false,

        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
    remark: {
        title: "备注",
        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("relation_type", schema, null, "eq.")

export default {
    schema,
    service,
}
