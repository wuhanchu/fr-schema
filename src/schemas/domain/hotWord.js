import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import moments from "moment"

const schema = {
    question_standard: {
        title: "标准问",
        required: true,
        searchPrefix: "like",
        sorter: true,
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        listHide: true,
        exportConcat: true,
        extra: "每行表示一个问题",
    },
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
        },
        listHide: true,
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
        },
        listHide: true,
    },
    project_id: {
        title: "项目",
        type: schemaFieldType.Select,
        listHide: true,
    },
    total: {
        title: "次数",
        // type: schemaFieldType.Select,
    },
}

const service = createApi("domain/match_question_count", schema, null, "")
service.get = (args) => {
    let time = new Date(parseInt(args.begin_time))
    let begin_time = args.begin_time
        ? moments(time).format("YYYY-MM-DD")
        : undefined
    time = new Date(parseInt(args.end_time))
    let end_time = args.end_time
        ? moments(time).format("YYYY-MM-DD")
        : undefined

    return createApi("domain/match_question_count", schema, null, "").get({
        ...args,
        order: "total",
        begin_time,
        end_time,
    })
}

export default {
    schema,
    service,
}
