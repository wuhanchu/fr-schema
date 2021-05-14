import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    id: {
        title: "编号",
        sorter: true,

        infoHide: true,
    },
    name: {
        title: "名称",
        searchPrefix: "like",
        sorter: true,
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        required: true,
    },

    type_key: {
        title: "类型",
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },
    domain_key: {
        title: "域",
        sorter: true,
        type: schemaFieldType.Select,
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
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
    remark: {
        title: "备注",
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        sorter: true,
        type: schemaFieldType.TextArea,
    },
    attribute: {
        title: "属性",
        listHide: true,
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        props: {
            style: { width: "500px" },
            height: "400px",
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
