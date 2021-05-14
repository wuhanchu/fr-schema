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
        searchPrefix: "like",
        sorter: true,
        required: true,
    },
    example: {
        title: "例子",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
        },
    },
    domain_key: {
        title: "域",
        sorter: true,
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
