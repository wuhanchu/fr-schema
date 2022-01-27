import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        style: { width: "500px" },
        props: {
            allowClear: true,
            showSearch: true,
        },
        type: schemaFieldType.Select,
    },
    name: {
        required: true,
        style: { width: "500px" },
        title: "名称",
    },
    key: {
        required: true,
        style: { width: "500px" },

        title: "编码",
    },
    project_id: {
        // required: true,
        style: { width: "500px" },
        title: "相关问题库",
        search: false,

        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    intent_key: {
        // required: true,
        style: { width: "500px" },
        search: false,

        title: "匹配意图",
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    intent_key_text: {
        style: { width: "500px" },
        search: false,

        title: "意图匹配辅助信息",
    },

    slot: {
        title: "全局槽位",
        search: false,

        hideInTable: true,
        props: {
            style: { width: "500px" },
            height: "300px",
        },
        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },

    create_time: {
        title: "创建时间",
        search: false,

        // required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        hideInTable: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
    update_time: {
        title: "更新时间",
        // required: true,
        search: false,

        sorter: true,
        addHide: true,
        editHide: true,
        hideInTable: true,
        props: {
            showTime: true,
            valueType: "dateTime",
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
service.upInsert = createApi(
    "flow?on_conflict=key",
    schema,
    null,
    "eq."
).upInsert

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
