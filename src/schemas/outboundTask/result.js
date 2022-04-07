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
    name: { title: "姓名", search: false },
    flow_key: {
        title: "流程",
        search: false,
        type: schemaFieldType.Select,
    },
    outbound_task_id: {
        title: "任务",
        search: false,
        hideInTable: true,
        type: schemaFieldType.Select,
    },
    type: {
        title: "类型",
        sorter: true,
        type: schemaFieldType.Select,
        dict: {
            in: { remark: "呼入", value: "in" },
            out: { remark: "呼出", value: "out" },
        },
    },

    status: {
        title: "状态",
        sorter: true,
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
        sorter: true,
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
        sorter: true,
        searchPrefix: "like",
    },
    to_phone: {
        title: "拨打号码",
        sorter: true,
        searchPrefix: "like",
    },
    fail_reason: {
        title: "失败原因",
        hideInTable: true,
        search: false,
    },

    phone_duration: {
        title: "通话时长",
        sorter: true,
        search: false,
        // unit: "ms",
        render: (item, data) => {
            return <>{decorateTime(item)}</>
        },
    },
    start_time: {
        title: "开始时间",
        sorter: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
        type: schemaFieldType.DatePicker,
    },
    end_time: {
        title: "结束时间",
        sorter: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
        type: schemaFieldType.DatePicker,
    },
    begin_time: {
        title: "拨通时间",
        sorter: true,
        search: false,
        props: {
            showTime: true,
            // valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
    external_id: {
        title: "外部编号",
        sorter: true,
        search: false,
    },
    batch_id: {
        title: "批次",
        sorter: true,
        search: false,
        type: schemaFieldType.Select,
    },
}

const service = createApi("call_record", schema, null, "eq.")
service.getBatch = async (args) => {
    let data = await createApi("outbound_task_batch", schema, null, "eq.").get(
        args
    )
    data.list = data.list.map((item) => {
        return {
            ...item,
            create_time: moment(item.create_time).format("YYYY-MM-DD HH:mm:ss"),
        }
    })
    return data
}
service.get = async (args) => {
    if (args.start_time) {
        let time = new Date(parseInt(args.start_time))
        let begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
        args.and = `(begin_time.gte.${begin_time})`
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        let end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
        args.and = `(begin_time.lte.${end_time})`
    }
    if (args.end_time && args.start_time) {
        let time = new Date(parseInt(args.start_time))
        let begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
        time = new Date(parseInt(args.end_time))
        let end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
        args.and = `(begin_time.gte.${begin_time},begin_time.lte.${end_time})`
    }
    args.end_time = undefined
    args.start_time = undefined
    args.select = "*,outbound_task!inner(flow_key)*"
    if (args.flow_key) {
        args["outbound_task.flow_key"] = "eq." + args.flow_key
        args.flow_key = undefined
    }
    let data = await createApi("call_record", schema, null, "eq.").get(args)
    data.list =
        data.list &&
        data.list.map((item) => {
            return { ...item.request_info, ...item.outbound_task, ...item }
        })
    return data
}

export default {
    schema,
    service,
}
