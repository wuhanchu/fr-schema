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
    flow_key: {
        title: "流程",
    },
    caller_number: {
        title: "呼出号码",
    },
    user_id: {
        title: "用户",
    },
    status: {
        title: "状态",
    },
    test: {
        title: "测试任务",
    },
    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },

    remark: {
        title: "备注",
        search: false,

        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("outbound_task", schema, null, "eq.")

export default {
    schema,
    service,
}
