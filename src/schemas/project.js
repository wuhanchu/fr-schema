import { createApi } from "@/outter/fr-schema/src/service"
import { schemas } from "@/outter/fr-schema-antd-utils/src"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    id: {
        title: "编号",
        sorter: true,
        infoHide: true
    },
    name: {
        title: "名称",
        sorter: true,
        required: true
    },
    remark: {
        title: "备注",
        type: schemaFieldType.TextArea,
        props: {
            autoSize: true
        }
    }
}

const service = createApi("project", schema, null, "eq.")
service.export = async args => {
    const res = await createApi(`project/mark`, schema).post(args)
    return res
}
export default {
    schema,
    service
}
