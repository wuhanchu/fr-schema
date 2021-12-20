import { schemaFieldType } from "@/outter/fr-schema/src/schema"

export default {
    key: {
        title: "键值",
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        searchPrefix: "like",
    },
    value: {
        title: "数值",
    },
    remark: {
        title: "备注",
        sorter: true,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        type: schemaFieldType.TextArea,
    },
}
