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
    public: {
        title: "公共库",
        // searchPrefix: "like",
        type: schemaFieldType.Select,
        dict: {
            true: {
                value: "true",
                remark: "是",
            },
            false: {
                value: "false",
                remark: "否",
            },
        },
        render: (item, props) => {
            if (props.public) {
                return "是"
            } else {
                return "否"
            }
        },

        required: true,
    },
    talk_service_id: {
        title: "对话服务",
        type: schemaFieldType.Select,
        // search: false
    },
    nlu_server_url: {
        title: "解析服务地址",
        search: false,
    },
    create_time: {
        title: "创建时间",
        required: true,
        search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },

    remark: {
        title: "备注",
        search: false,

        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("domain", schema, null, "eq.")
// 得到服务列表
service.getServices = createApi("z_ai_service/service", schema, null, "eq.").get
// 创建会话
service.conversation = createApi("chat/conversation", schema, null, "eq.").post
// 发送消息
service.message = createApi("chat/message", schema, null, "eq.").post

// 创建会话
service.flowConversation = createApi(
    "chat/conversation",
    schema,
    null,
    "eq."
).post

// 结束
service.closeConversation = createApi(
    "chat/conversation",
    schema,
    null,
    "eq."
).put

// 发送消息
service.flowMessage = createApi("chat/message", schema, null, "eq.").post

service.intentIdentify = async function (args) {
    const data = await createApi("intent/identify", schema, null).getBasic({
        ...args,
    })
    return data
}

// 人员
service.getDomainUser = async (args) => {
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
service.sync = createApi("domain/train", schema, null, "eq.").post
service.fsfundSync = createApi("domain/sync", schema, null, "eq.").post
service.cache_tts = createApi("domain/cache_tts", schema, null, "eq.").post

export default {
    schema,
    service,
}
