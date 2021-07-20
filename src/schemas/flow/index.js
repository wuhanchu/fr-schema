import { createApi } from "@/outter/fr-schema/src/service"
import answer from "./answer"
import intention from "./intention"
import node from "./node"

let service = createApi("intent")

service.get = () => {
    return { list: [] }
}
// service.getDetail = ()=>{
//     return {list: []}
// }
/**
 * form current robot clone one new
 * @param id robot id
 * @param others
 * @returns new robot info
 */
service.clone = ({ id, ...others }) => {
    return createApi(`talk_robot/clone/${id}`).post(others)
}

/**
 * release current robot
 * @param id robot id
 */
service.release = (id) => {
    return createApi(`talk_robot/${id}/status`).put({ status: 2 })
}
service.withdraw = (id) => {
    return createApi(`talk_robot/${id}/status`).put({ status: 1 })
}
service.sync = (data) => {
    const { id, ...others } = data
    return createApi(`update_all/${id}`).put(others)
}

export default {
    service,
    answer,
    intention,
    node,
}
