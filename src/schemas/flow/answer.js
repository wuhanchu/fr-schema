import { createApi } from "@/outter/fr-schema/src/service"

let service = createApi("intention_answer")
service.getByIntention = async args => {
    const { intention_id, ...others } = args
    const response = await createApi(
        `intention/${intention_id}/answers`
    ).getBasic(others)
    return response.data
}

export default {
    service
}
