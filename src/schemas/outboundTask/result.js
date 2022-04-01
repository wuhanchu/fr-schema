import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    customer_id: {
        title: "客户编号",
        search: false,
    },
    result: {
        title: "结果",
        type: schemaFieldType.Select,
        dict: {
            normal: { remark: "正常", value: "normal" },
            failed: { remark: "拨打失败", value: "failed" },
            no_connect: { remark: "未接通", value: "no_connect" },
            no_answer: { remark: "无应答", value: "no_answer" },
            busy: { remark: "忙线", value: "busy" },
            empty: { remark: "空号", value: "empty" },
            shutdown: { remark: "关机", value: "shutdown" },
            halt: { remark: "停机", value: "halt" },
            other: { remark: "其他", value: "other" },
        },
    },
    type: {
        title: "类型",
        type: schemaFieldType.Select,
        dict: {
            in: { remark: "呼入", value: "in" },
            out: { remark: "呼出", value: "out" },
        },
    },
    status: {
        title: "状态",
        type: schemaFieldType.Select,
        dict: {
            created: { remark: "已创建", value: "created" },
            wait: { remark: "等待", value: "wait" },
            calling: { remark: "响铃中", value: "calling" },
            on_the_phone: { remark: "通话中", value: "on_the_phone" },
            end: { remark: "已结束", value: "end" },
        },
    },

    form_phone: {
        title: "呼出号码",
        searchPrefix: "like",
    },
    to_phone: {
        title: "拨打号码",
        searchPrefix: "like",
    },
    fail_reason: {
        title: "失败原因",
        search: false,
    },

    phone_duration: {
        title: "通话时长",
        search: false,
        unit: "ms",
    },
    wait_duration: {
        search: false,
        title: "排队时长",
        unit: "ms",
    },
    calling_duration: {
        title: "振铃时长",
        search: false,
        unit: "ms",
    },
    external_id: {
        title: "外部编号",
        search: false,
    },
    conversation_id: {
        title: "会话信息编号",
        search: false,
    },
    phone_audio_url: {
        title: "录音地址",
        search: false,
    },
    begin_time: {
        title: "开始时间",
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
    end_time: {
        title: "结束时间",
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("call_record", schema, null, "eq.")

export default {
    schema,
    service,
}
