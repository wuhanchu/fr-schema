import { createApi } from "@/outter/fr-schema/src/service"
import { schemas } from "@/outter/fr-schema-antd-utils/src"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
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
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        style: { width: "500px" },
        required: true,
    },

    remark: {
        title: "备注",
        type: schemaFieldType.TextArea,
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
    },
    config: {
        title: "配置",
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

const service = createApi("project", schema, null, "eq.")
service.export = async (args) => {
    const res = await createApi(`project/mark`, schema).post(args)
    return res
}
service.import = async (args) => {
    const res = await createApi(`project/mark/sync`, schema).post(args)
    return res
}
service.getMinioToken = async (args) => {
    const res = await createApi(`file/auth`, schema).post({})
    return res
}

export default {
    schema,
    service,
}
