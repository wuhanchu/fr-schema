import { createApi, createBasicApi } from "@/components/ListPage/service"

import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        addHide: true,
        editHide: true,
        style: { width: "500px" },
        props: {
            allowClear: true,
            showSearch: true,
        },
        search: false,
        type: schemaFieldType.Select,
    },
    name: {
        required: true,
        sorter: true,
        style: { width: "500px" },
        title: "名称",
    },
    key: {
        title: "编码",
        required: true,
        style: { width: "500px" },
        sorter: true,
        extra: "域中的唯一编码,可用中文。初始化好了以后，请不要随意修改。",
    },
    intent_key: {
        style: { width: "500px" },
        search: false,
        title: "匹配意图",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
        extra: "没有指定话术流程的对话中触发进入流程的意图。",
    },
    project_id: {
        style: { width: "500px" },
        title: "相关问题库",
        search: false,

        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
        extra: "用于支持搜索问题库(意图)的识别。请谨慎填写，会影响性能。",
    },
    intent_key_text: {
        title: "关键信息",
        style: { width: "500px" },
        search: false,
        sorter: true,
        extra: "拼接搜索文本，用于支持搜索问题库(意图)的识别。",
    },
    create_time: {
        title: "创建时间",
        search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        hideInTable: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
    update_time: {
        title: "更新时间",
        search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        hideInTable: true,
        props: {
            // showTime: true,
            // valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
    config: {
        title: "流程代码",
        // required: true,
        search: false,
        editHide: true,
        addHide: true,
        hideInTable: true,
        props: {
            style: { width: "900px" },
            height: "500px",
        },
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
}

const service = createApi("flow", schema, null, "eq.")
service.get = async (args) => {
    if (args.domain_key instanceof Array) {
        args.domain_key = "in.(" + args.domain_key.join(",") + ")"
    }
    return await createApi("flow", schema, null, "eq.").get(args)
}
service.upInsert = createApi(
    "flow?on_conflict=key",
    schema,
    null,
    "eq."
).upInsert

service.getActionType = async (args) => {
    let data = await createApi("action_type", schema, null, "eq.").get(args)
    let list = data.list.map((item) => {
        return { ...item, remarks: item.remark }
    })
    return { ...data, list }
}
service.getActionParam = async (args) => {
    let data = await createApi("action_param", schema, null, "eq.").get({
        ...args,
        order: "require.desc",
    })
    let list = data.list.map((item) => {
        return { ...item, remarks: item.remark }
    })
    return { ...data, list }
}

service.patch = async (args) => {
    await createApi("flow", schema, null, "eq.").patch(args)
    await createApi("flow_history", schema, null, "eq.").post({
        config: args.config,
        flow_key: args.key,
        domain_key: args.domain_key,
    })
}

service.uploadExcel = createBasicApi("intent/import").post

export default {
    schema,
    service,
}
