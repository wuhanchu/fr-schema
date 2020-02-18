import { createApi } from "@/outter/fr-schema/src/service"
import { schemas } from "@/outter/fr-schema-antd-utils/src"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
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

const service = createApi("postgrest/project", schema)

export default {
    schema,
    service
}
