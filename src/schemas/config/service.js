import { createApi } from "@/outter/fr-schema/src/service"
import schema from "./schema"

export default createApi("config", schema, null, "eq.")
