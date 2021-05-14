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
        style: { width: "400px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        required: true,
    },
    key: {
        title: "主键",
        searchPrefix: "like",
        sorter: true,
        style: { width: "400px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
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
    content: {
        title: "内容",
        listHide: true,
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        props: {
            style: { width: "400px" },
            height: "400px",
        },
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
    remark: {
        title: "备注",
        style: { width: "400px", height: "84px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        position: "right",
        type: schemaFieldType.TextArea,
        sorter: true,
    },
    config: {
        title: "配置",
        listHide: true,
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        position: "right",
        props: {
            style: { width: "400px" },
            height: "400px",
        },
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
}

const service = createApi("domain", schema, null, "eq.")

export default {
    schema,
    service,
}
