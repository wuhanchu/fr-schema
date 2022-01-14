import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        style: { width: "500px" },
        // addHide: true,
        // editHide: true,
        required: true,
        type: schemaFieldType.Select,
    },
    type_key: {
        title: "类型",
        style: { width: "500px" },
        // itemProps: {
        //     labelCol: {
        //         span: 4,
        //     },
        // },
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },

    name: {
        title: "名称",
        searchPrefix: "like",
        sorter: true,
        style: { width: "500px" },
        // itemProps: {
        //     labelCol: {
        //         span: 4,
        //     },
        // },
        required: true,
    },

    create_time: {
        title: "创建时间",
        sorter: true,
        addHide: true,
        editHide: true,
        search: false,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
    remark: {
        title: "备注",
        search: false,
        style: { width: "500px" },

        sorter: true,
        type: schemaFieldType.TextArea,
    },
    attribute: {
        title: "属性",
        hideInTable: true,
        search: false,

        props: {
            style: { width: "500px" },
            height: "300px",
        },
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
}

const service = createApi("entity", schema, null, "eq.")

export default {
    schema,
    service,
}
