import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker } from "antd"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

const schema = {
    create_time: {
        title: "时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
        },
        renderInput: () => <RangePicker style={{ width: "100%" }} />,
        type: schemaFieldType.DatePicker,
    },
    status: {
        title: "状态",
        sorter: true,
        addHide: true,
        editHide: true,
        required: true,
        type: schemaFieldType.Select,
    },
    project_id: {
        title: "问题库",
        style: { width: "500px" },
        type: schemaFieldType.Select,
        sorter: true,
        required: true,
    },

    name: {
        title: "标准问",
        searchPrefix: "like",
        sorter: true,
        style: { width: "500px" },
        required: true,
    },

    remark: {
        title: "补充扩展问",
        style: { width: "500px" },
        sorter: true,
        type: schemaFieldType.TextArea,
    },
}

const service = createApi("entity", schema, null, "eq.")

export default {
    schema,
    service,
}
