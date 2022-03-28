import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    start_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        hideInTable: true,
    },
    finish_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        hideInTable: true,
    },
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
    caller_group_id: {
        title: "号码组",
        hideInTable: true,
        search: false,
        type: schemaFieldType.Select,
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
service.getDict = async (args) => {
    return createApi("outbound/dictionary", schema, null, "").getBasic(args)
}

export default {
    schema,
    service,
}
