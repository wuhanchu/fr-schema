import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        addHide: true,
        editHide: true,
        // required: true,
        type: schemaFieldType.Select,
        search: false,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
        required: true,
    },
    type: {
        title: "类型",
        type: schemaFieldType.Select,
        dict: {
            sms: { remark: "短信", value: "sms" },
            email: { remark: "邮件", value: "email" },
        },
    },
    from_address: {
        title: "发送地址",
    },
    to_address: {
        title: "接收地址",
    },
    content: {
        title: "内容",
    },
    status: {
        title: "状态",
        type: schemaFieldType.Select,
        dict: {
            created: { remark: "已创建", value: "created" },
            wait: { remark: "等待", value: "wait" },
            end: { remark: "已结束", value: "end" },
        },
    },
    result: {
        title: "结果",
        type: schemaFieldType.Select,
        dict: {
            failed: { remark: "发送失败", value: "failed" },
            normal: { remark: "正常", value: "normal" },
        },
    },
    fail_reason: {
        title: "失败原因",
    },
    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },
    end_time: {
        title: "结束时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("message", schema, null, "eq.")

export default {
    schema,
    service,
}
