import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        required: true,
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        searchPrefix: "like",
        required: true,
    },
    key: {
        title: "编码",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        searchPrefix: "like",
        required: true,
    },
    intent_key: {
        title: '意图',
        type: schemaFieldType.MultiSelect,
        style: { width: "500px" },
        render: (text) => <span>{text && text.toString()}</span>
    },
    template_text: {
        title: '回复文本',
        type: schemaFieldType.TextArea,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 3, maxRows: 6 },
        },
        render: (item) => <span>{item && (item.toString().length > 20 ? item.toString().substr(0, 20) : item.toString())}</span>
    },
    template: {
        title: "模板",
        listHide: true,
        props: {
            style: { width: "500px" },
            height: "400px",
        },
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
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

const service = createApi("response", schema, null, "eq.")

export default {
    schema,
    service,
}
