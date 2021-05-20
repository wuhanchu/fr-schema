import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    name: {
        title: "名称",
        searchPrefix: "like",
        sorter: true,
        required: true,
    },
    key: {
        title: "编码",
        searchPrefix: "like",
        sorter: true,
        required: true,
    },
    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
    talk_service_id: {
        title: "对话服务编号",
    },
    remark: {
        title: "备注",
        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("domain", schema, null, "eq.")
// 得到服务列表
service.getServices = createApi("z_ai_service/service", schema, null, "eq.").get
// 创建会话
service.conversation = createApi(
    "z_ai_service/chat/conversation",
    schema,
    null,
    "eq."
).post
// 发送消息
service.message = createApi(
    "z_ai_service/chat/message",
    schema,
    null,
    "eq."
).post
// 人员
service.getTeamUser = async (args) => {
    const data = await createApi("domain_user", schema, null).get({
        ...args,
        limit: 1000,
    })
    return data
}
service.setUser = createApi("domain/domain_user", schema, null, "eq.").put
// 人员

service.getUserAuthUser = async (args) => {
    const data = await createApi("user_auth/user", schema, null, "eq.").get({
        ...args,
        limit: 1000,
    })
    return data
}

export default {
    schema,
    service,
}
