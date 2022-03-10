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
        title: "公共域",
        // searchPrefix: "like",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        sorter: true,

        props: {},
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
    base_domain_key: {
        title: "基础域",
        sorter: true,

        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
        search: false,
        render: (item, props) => {
            console.log(props.base_domain_key)
            if (props.base_domain_key.length) {
                return item
            } else {
                return "-"
            }
        },
    },
    talk_service_id: {
        sorter: true,

        title: "对话服务",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        // search: false
    },

    nlu_server_url: {
        sorter: true,

        title: "解析服务地址",
        search: false,
    },
    text2vec_server_url: {
        sorter: true,

        title: "向量服务地址",
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

service.patch = async function (args) {
    Object.keys(schema).forEach(function (key) {
        if (!args[key] && schema[key].editHide !== true) {
            args[key] = null
        }
    })
    const data = await createApi("domain", schema, null).patch(args)
    return data
}
service.patchConfig = async function (args) {
    const data = await createApi("domain", schema, null).patch(args)
    return data
}
service.sync = createApi("domain/train", schema, null, "eq.").post
service.fsfundSync = createApi("domain/sync", schema, null, "eq.").post
service.cache_tts = createApi("domain/cache_tts", schema, null, "eq.").post
service.cache = createApi("cache", schema, null, "").deleteBody

service.get = async (args) => {
    let data = await createApi("domain", schema, null, "eq.").get(args)
    console.log(data)
    let { list } = data
    list = list.map((item) => {
        return {
            ...item,
            base_domain_key: item.base_domain_key || [],
        }
    })
    return { ...data, list }
}

export default {
    schema,
    service,
}
