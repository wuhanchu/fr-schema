import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { DatePicker } from "antd"
import moment from "moment"
import { decorateTime } from "@/utils/utils"

const { RangePicker } = DatePicker
const schema = {
    // customer_id: {
    //     title: "客户编号",
    //     search: false,
    // },

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
    from_phone: {
        title: "呼出号码",
        searchPrefix: "like",
    },
    to_phone: {
        title: "拨打号码",
        searchPrefix: "like",
    },
    fail_reason: {
        title: "失败原因",
        hideInTable: true,
        search: false,
    },

    phone_duration: {
        title: "通话时长",
        search: false,
        // unit: "ms",
        render: (item, data) => {
            return <>{decorateTime(item)}</>
        },
    },
    begin_time: {
        title: "拨通时间",
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        renderInput: () => {
            return (
                <RangePicker
                    allowEmpty={[true, true]}
                    format="MM-DD HH:mm:ss"
                    showTime
                ></RangePicker>
            )
        },
        type: schemaFieldType.DatePicker,
    },
    end_time: {
        title: "挂机时间",
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        renderInput: () => {
            return (
                <RangePicker
                    allowEmpty={[true, true]}
                    format="MM-DD HH:mm:ss"
                    showTime
                ></RangePicker>
            )
        },
        type: schemaFieldType.DatePicker,
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
}

const service = createApi("call_record", schema, null, "eq.")
service.getBatch = createApi("outbound_task_batch", schema, null, "eq.").get
service.get = async (args) => {
    let andArray = []
    if (args.begin_time) {
        if (args.begin_time.split(",")[0]) {
            andArray.push(
                `begin_time.gte.${moment(args.begin_time.split(",")[0]).format(
                    "YYYY-MM-DDTHH:mm:ss"
                )}`
            )
        }
        if (args.begin_time.split(",")[1]) {
            andArray.push(
                `begin_time.lte.${moment(args.begin_time.split(",")[1]).format(
                    "YYYY-MM-DDTHH:mm:ss"
                )}`
            )
        }
    }
    if (args.end_time) {
        if (args.end_time.split(",")[0]) {
            andArray.push(
                `end_time.gte.${moment(args.end_time.split(",")[0]).format(
                    "YYYY-MM-DDTHH:mm:ss"
                )}`
            )
        }
        if (args.end_time.split(",")[1]) {
            andArray.push(
                `end_time.lte.${moment(args.end_time.split(",")[1]).format(
                    "YYYY-MM-DDTHH:mm:ss"
                )}`
            )
        }
    }

    args.begin_time = undefined
    args.end_time = undefined
    args.and = andArray.length ? "(" + andArray.join(",") + ")" : undefined

    let data = createApi("call_record", schema, null, "eq.").get(args)
    return data
}

export default {
    schema,
    service,
}
