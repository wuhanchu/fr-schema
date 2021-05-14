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
        sorter: true,
        searchPrefix: "like",
        required: true,
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
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
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        style: { width: "500px" },
        title: "备注",
        type: schemaFieldType.TextArea,
        sorter: true,
    },
    content: {
        title: "内容",
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

const service = createApi("story", schema, null, "eq.")

export default {
    schema,
    service,
}
