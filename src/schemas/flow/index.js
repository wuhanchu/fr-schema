import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
    },
    name: {
        required: true,
        title: "名称",
    },
    key: {
        required: true,
        title: "编码",
    },

    create_time: {
        title: "创建时间",
        // required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        listHide: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
    update_time: {
        title: "更新时间",
        // required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        listHide: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
    config: {
        title: "流程代码",
        // required: true,
        editHide: true,
        addHide: true,
        listHide: true,
        props: {
            style: { width: "900px", marginBottom: "-24px" },
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
