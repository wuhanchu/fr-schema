import { createApi } from "@/outter/fr-schema/src/service"
import { schemas } from "@/outter/fr-schema-antd-utils/src"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    id: {
        sorter: true,
        title: "编号",
        addHide: true,
        editHide: true,
        search: false,
    },
    domain_key: {
        title: "域",
        sorter: true,
        type: schemaFieldType.Select,
        required: true,
        style: { width: "500px" },
    },
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
        style: { width: "500px" },
        required: true,
    },
    inside: {
        title: "是否内部问题库",
        type: schemaFieldType.Select,
        style: { width: "500px" },
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
    },
    remark: {
        title: "备注",
        search: false,

        type: schemaFieldType.TextArea,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
    },
    config: {
        title: "配置",
        search: false,
        hideInTable: true,
        props: {
            style: { width: "500px" },
            height: "300px",
        },
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
}

const service = createApi("project", schema, null, "eq.")
service.getDetail = async (args) => {
    let res = await createApi("project", schema, null, "eq.").getDetail(args)
    console.log(res)
    return res
}

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
