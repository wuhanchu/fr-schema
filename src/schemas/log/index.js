import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    client_id: {
        title: "渠道",
        sorter: true,
        addHide: true,
        editHide: true,
        // required: true,
        type: schemaFieldType.Select,
        // search: false,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    user_id: {
        title: "用户",
        sorter: true,
        type: schemaFieldType.Select,
        required: true,
    },
    path: {
        title: "路径",
        sorter: true,
        searchPrefix: "like",
        required: true,
    },
    method: {
        title: "方法",
        searchPrefix: "like",
    },
    status: {
        title: "状态",
        search: false,
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
    remote_addr: {
        title: "远程地址",
        search: false,
        hideInTable: true,
        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("api_log", schema, null, "eq.")

export default {
    schema,
    service,
}
