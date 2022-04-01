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
    },
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
        // required: true,
    },

    gender: {
        title: "性别",
        sorter: true,
        type: schemaFieldType.Select,
        dict: {
            male: { remark: "男", value: "male" },
            female: { remark: "女", value: "female" },
        },
    },
    email: {
        title: "邮箱",
        sorter: true,
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
            valueType: "dateTime",
        },
        search: false,
        type: schemaFieldType.DatePicker,
    },
    auto_maxtimes: {
        title: "自动重拨次数",
        sorter: true,
        hideInTable: true,
    },
    remark: {
        title: "备注",
        search: false,
        sorter: true,
        type: schemaFieldType.TextArea,
        sorter: true,
    },
}

const service = createApi("customer", schema, null, "eq.")

export default {
    schema,
    service,
}
