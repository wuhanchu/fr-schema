import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    customer_id: {
        title: "客户编号",
    },
    type: {
        title: "类型",
    },
    form_phone: {
        title: "呼出号码",
    },
    to_phone: {
        title: "拨打号码",
    },
    status: {
        title: "状态",
    },
    result: {
        title: "结果",
    },
    fail_reason: {
        title: "失败原因",
    },
    begin_time: {
        title: "开始时间",
    },
    end_time: {
        title: "结束时间",
    },
    phone_duration: {
        title: "通话时长",
    },
    wait_duration: {
        title: "排队时长",
    },
    calling_duration: {
        title: "振铃时长",
    },
    external_id: {
        title: "外部编号",
    },
    conversation_id: {
        title: "会话信息编号",
    },
    phone_audio_url: {
        title: "录音地址",
    },
}

const service = createApi("call_record", schema, null, "eq.")

export default {
    schema,
    service,
}
