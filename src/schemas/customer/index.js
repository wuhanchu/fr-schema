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
    telephone: {
        title: "电话号码",
        required: true,
        sorter: true,
        searchPrefix: "like",
    },
    name: {
        title: "姓名",
        sorter: true,
        searchPrefix: "like",
        // required: true,
    },

    title: {
        title: "称呼",
        sorter: true,
        searchPrefix: "like",
    },
    block: {
        title: "是否屏蔽",
        type: schemaFieldType.Select,
        sorter: true,

        dict: {
            true: { remark: "是", value: "true" },
            false: { remark: "否", value: "false" },
        },
    },

    create_time: {
        title: "创建时间",
        // required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            // valueType: "dateTime",
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },
}

const callSchema = {
    flow_key: {
        title: "流程",
        required: true,
        type: schemaFieldType.Select,
    },
    slot: {
        title: "槽位",
        search: false,
        hideInTable: true,
        props: {
            style: { width: "300px" },
            height: "300px",
        },
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
        extra: "通话中用到的槽位，如名称，性别等",
    },
}

const service = createApi("customer", schema, null, "eq.")
service.call = async (args) => {
    let data = await createApi("outbound/call", null, null, "").post(args)
    return data
}
export default {
    schema,
    callSchema,
    service,
}
