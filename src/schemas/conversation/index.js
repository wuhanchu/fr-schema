import { createApi } from "@/outter/fr-schema/src/service"

const schema = {}

const service = createApi("conversation_detail", schema, null, "eq.")

export default {
    schema,
    service,
}
