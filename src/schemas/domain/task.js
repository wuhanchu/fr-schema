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
        props: {
            allowClear: true,
            showSearch: true,
        },
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
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        hideInTable: true,
    },
}

const service = createApi("task", schema, null, "eq.")
service.getTaskInfo = createApi("task_log", schema, null, "eq.").get

export default {
    schema,
    service,
}
