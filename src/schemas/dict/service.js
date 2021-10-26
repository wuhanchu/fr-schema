import { createApi } from "@/outter/fr-schema/src/service"
import { async } from "@antv/x6/lib/registry/marker/async"
import schema from "./schema"

const service = createApi("dict", schema, "", "eq.")
service.get = async (args) => {
    let res = await createApi("dict", schema, "", "eq.").get({ ...args })
    res.list = res.list.map((item) => {
        return { ...item, remarks: item.remark }
    })
    return res
}
service.getDictType = createApi("dict_type", schema, null, null).get

export default service
