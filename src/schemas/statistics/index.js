import { createApi } from "@/outter/fr-schema/src/service"
import {
    convertFromRemote,
    schemaFieldType,
} from "@/outter/fr-schema/src/schema"
import moment from "moment"
import { DatePicker } from "antd"
import { request } from "@/outter/fr-schema/src"
import queryString from "query-string"
const config = SETTING
const { RangePicker } = DatePicker

const schema = {
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
    },

    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
    },
    id: {
        title: "编号",
        sorter: true,
        search: false,
    },
    domain_key: {
        title: "域",
        hideInTable: true,
        search: false,
        type: schemaFieldType.Select,
        sorter: true,
        fieldProps: {
            allowClear: false,
        },
        props: {
            allowClear: false,
        },
    },
    question_standard: {
        title: "匹配问题",
        required: true,
        searchPrefix: "like",
        search: false,
        sorter: true,
    },
    question_extend: {
        title: "扩展问",
        // type: schemaFieldType.Select,
        type: schemaFieldType.TextArea,
        search: false,

        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        hideInTable: true,
        exportConcat: true,
        extra: "每行表示一个问题",
    },

    total: {
        title: "匹配次数",
        search: false,

        sorter: true,
    },
    mark_total: {
        sorter: true,
        title: "参与评价数",
        search: false,
    },
    mark_right_num: {
        sorter: true,
        search: false,

        title: "解决问题数",
    },
    mark_error_num: {
        sorter: true,
        title: "未解决问题数",
        search: false,
    },
    client_id: {
        title: "渠道",
        hideInTable: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
    },
    project_id: {
        title: "问题库",
        hideInTable: true,
        type: schemaFieldType.Select,
        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
        },
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
    if (args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        args.begin_time = moment(time).format("YYYY-MM-DD") + "T00:00:00"
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        args.end_time = moment(time).format("YYYY-MM-DD") + "T23:59:59"
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
    // match_question_summary
    const summary = await createApi(
        "domain/match_question_summary",
        schema,
        null,
        ""
    ).get(args)
    return {
        list,
        pagination: { current: currentPage, pageSize, total },
        summary: summary.list,
    }
}

export default {
    schema,
    service,
}
