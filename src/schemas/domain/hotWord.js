import { createApi } from "@/outter/fr-schema/src/service"
import {
    convertFromRemote,
    schemaFieldType,
} from "@/outter/fr-schema/src/schema"
import moments from "moment"
import { request } from "@/outter/fr-schema/src"
import queryString from "query-string"
const config = SETTING

const schema = {
    id: {
        title: "编号",
        sorter: true,
        search: false,
    },
    question_standard: {
        title: "标准问",
        required: true,
        search: false,

        searchPrefix: "like",
        sorter: true,
    },
    question_extend: {
        title: "扩展问",
        search: false,

        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        hideInTable: true,
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
        hideInTable: true,
    },
    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
        },
        hideInTable: true,
    },
    project_id: {
        title: "项目",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        hideInTable: true,
        span: 7,
    },
    total: {
        title: "次数",
        search: false,
        // type: schemaFieldType.Select,
    },
}

const service = createApi("domain/match_question_count", schema, null, "")
service.getRecentHotQuestion = createApi(
    "domain/recent_hot_question",
    schema,
    null,
    ""
).get
service.get = async (args) => {
    let time
    if (typeof args.begin_time === "string") {
        time = new Date(parseInt(args.begin_time))
        args.begin_time = args.begin_time
            ? moments(time).format("YYYY-MM-DD")
            : undefined
    } else {
        console.log(args.begin_time)
        if (args.begin_time)
            args.begin_time = args.begin_time
                ? args.begin_time.format("YYYY-MM-DD")
                : undefined
    }

    // time = new Date(parseInt(args.end_time))
    // args.end_time = args.end_time
    //     ? args.end_time.format("YYYY-MM-DD")
    //     : undefined
    if (typeof args.end_time === "string") {
        time = new Date(parseInt(args.end_time))
        args.end_time = args.end_time
            ? moments(time).format("YYYY-MM-DD")
            : undefined
    } else {
        console.log(args.end_time)
        if (args.end_time)
            args.end_time = args.end_time
                ? args.end_time.format("YYYY-MM-DD")
                : undefined
    }
    let { currentPage, pageSize, limit, ...otherParams } = args
    if (args.order) {
        args.sort = args.order.split(".")[1]
        args.order = args.order.split(".")[0]
    }
    // convert moment
    Object.keys(otherParams).forEach((key) => {
        const item = args[key]
        if (item === undefined) {
            return
        }
        otherParams[key] = item
    })
    limit = pageSize || limit || 10

    const response = await request(
        {
            method: "GET",
            url: (
                "/" +
                config.apiVersion +
                "domain/match_question_count" +
                "?" +
                queryString.stringify({
                    offset: limit * ((currentPage || 1) - 1),
                    limit,
                    ...otherParams,
                })
            ).replace("//", "/"),
        },
        {
            headers: {
                Prefer: "count=exact",
            },
        }
    )

    if (!response) {
        return
    }
    let total
    if (!_.isNil(response.contentRange)) {
        total = response.contentRange.split("/")[1]
    }
    const { list } = response || {}
    return {
        list,
        pagination: { current: currentPage, pageSize, total },
    }
}

export default {
    schema,
    service,
}
