import { createApi } from "@/outter/fr-schema/src/service"
import {
    convertFromRemote,
    schemaFieldType,
} from "@/outter/fr-schema/src/schema"
import moments from "moment"

const schema = {
    id: {
        title: "编号",
        sorter: true,
    },
    name: {
        title: "名称",
        required: true,
        searchPrefix: "like",
        sorter: true,
    },
    process: {
        title: "进度",
        required: true,
        searchPrefix: "like",
        sorter: true,
    },
    status: {
        title: "状态",
        required: true,
        type: schemaFieldType.Select,
        dict: {
            running: {
                value: "running",
                remark: "运行中",
            },
            end: {
                value: "end",
                remark: "结束",
            },
        },
        // searchPrefix: "like",
        sorter: true,
    },
    remark: {
        title: "备注",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        listHide: true,
    },
}

const service = createApi("task", schema, null, "eq.")

export default {
    schema,
    service,
}
