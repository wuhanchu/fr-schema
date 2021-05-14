import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    id: {
        title: "编号",
        sorter: true,

        infoHide: true,
    },
    name: {
        title: "名称",
        style: { width: "500px" },
        searchPrefix: "like",
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        sorter: true,
        required: true,
    },
    example: {
        title: "例子",
        sorter: true,
        style: { width: "500px" },
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        required: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
    },
    domain_key: {
        title: "域",
        itemProps: {
            labelCol: {
                span: 4,
            },
        },
        sorter: true,
        style: { width: "500px" },
        type: schemaFieldType.Select,
    },
    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("intent", schema, null, "eq.")

export default {
    schema,
    service,
}
