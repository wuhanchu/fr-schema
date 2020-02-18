import { createApi } from "@/outter/fr-schema/src/service"

const schema = {
    name: {
        title: "名称",
        required: true
    }
}

const service = createApi("postgrest/group", schema)

export default {
    schema,
    service
}
