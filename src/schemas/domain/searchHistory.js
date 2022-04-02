import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import moment from "moment"
import { Tooltip, DatePicker } from "antd"
import { isNull } from "lodash"
const { RangePicker } = DatePicker

const schema = {
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            showTime: true,
            valueType: "dateTime",
        },
        hideInTable: true,
    },

    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            showTime: true,
            valueType: "dateTime",
        },
        hideInTable: true,
    },

    create_time: {
        title: "提问时间",
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
        sorter: true,
        search: false,
    },
    search: {
        title: "用户提问",
        render: (text) => {
            return (
                <Tooltip title={text}>
                    <div
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "400px",
                        }}
                    >
                        {text}
                    </div>
                </Tooltip>
            )
        },
        searchPrefix: "like",
    },

    have_match_project_id: {
        title: "匹配情况",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        dict: {
            have: {
                value: "have",
                remark: "有匹配",
            },
            notHave: {
                value: "notHave",
                remark: "无匹配",
            },
        },
        render: (item, data) => {
            if (data.match_project_id) {
                return "有匹配"
            } else {
                return "无匹配"
            }
        },
    },
    project_id: {
        title: "搜索库",
        required: true,
        search: false,
        render: (text) => {
            return (
                <Tooltip title={text}>
                    <div
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                        }}
                    >
                        {text}
                    </div>
                </Tooltip>
            )
        },
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    match_project_id: {
        title: "匹配库",
        search: false,
        required: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    match_question_txt: {
        title: "匹配问题",
        search: false,
        render: (text) => {
            return (
                <Tooltip title={text}>
                    <div
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "400px",
                        }}
                    >
                        {text}
                    </div>
                </Tooltip>
            )
        },
        required: true,
        searchPrefix: "like",
    },
    user_confirm: {
        title: "是否评价",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        dict: {
            true: {
                value: true,
                remark: "已解决",
            },
            false: {
                value: false,
                remark: "未解决",
            },
        },
        render: (item) => {
            if (item === null) {
                return "未评价"
            } else {
                return item
            }
        },
    },
    final_result: {
        title: "数据范围",
        hideInTable: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        dict: {
            true: {
                value: "true",
                remark: "有效",
            },
            false: {
                value: "false",
                remark: "全部",
            },
        },
    },
    client_id: {
        title: "搜索渠道",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
            mode: "tags",
        },
        // listHide: true,
        addHide: true,
        editHide: true,
    },
    task_id: {
        title: "处理状态",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        dict: {
            have: {
                value: "have",
                remark: "有处理",
            },
            notHave: {
                value: "notHave",
                remark: "无处理",
            },
        },
        render: (item, data) => {
            if (data.task_id === null) {
                return "无处理"
            } else {
                return "有处理"
            }
        },
    },
}

const service = createApi("search_history", schema, null)

service.get = async (args) => {
    if (args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        let begin_time = moment(time).format("YYYY-MM-DDTHH:mm:ss")
        args.and = `(create_time.gte.${begin_time})`
    }
    if (args.end_time) {
        let time = new Date(parseInt(args.end_time))
        let end_time = moment(time).format("YYYY-MM-DDTHH:mm:ss")
        args.and = `(create_time.lte.${end_time})`
    }
    if (args.end_time && args.begin_time) {
        let time = new Date(parseInt(args.begin_time))
        let begin_time = moment(time).format("YYYY-MM-DDTHH:mm:ss")
        time = new Date(parseInt(args.end_time))
        let end_time = moment(time).format("YYYY-MM-DDTHH:mm:ss")
        args.and = `(create_time.gte.${begin_time},create_time.lte.${end_time})`
    }
    args.end_time = undefined
    args.begin_time = undefined
    if (args.have_match_project_id) {
        if (args.have_match_project_id === "have") {
            args.match_project_id = "not.is.null"
        }
        if (args.have_match_project_id === "notHave") {
            args.match_project_id = "is.null"
        }
    }
    if (args.final_result === "false") {
        args.final_result = undefined
    }
    if (args.task_id) {
        if (args.task_id === "have") {
            args.task_id = "not.is.null"
        }
        if (args.task_id === "notHave") {
            args.task_id = "is.null"
        }
    }
    args.have_match_project_id = undefined

    if (args.user_confirm === "null") {
        args.user_confirm = "is.null"
    }
    if (args.client_id) {
        // args.client_id = "in.(" + args.client_id + ")"
        if (args.client_id.indexOf("null") > -1) {
            args.or =
                "(client_id.is.null, client_id.eq." +
                args.client_id.split(",").join(", client_id.eq.") +
                ")"
        } else {
            args.or =
                "(client_id.eq." +
                args.client_id.split(",").join(", client_id.eq.") +
                ")"
        }
        args.client_id = undefined
    } else {
        args.client_id = undefined
    }
    let data = await createApi("search_history", schema, null, "eq.").get(args)
    return data
}

service.patch = async (args, user_confirm, task_id) => {
    if (!args.return_question) {
        args.match_question_id = null
        args.match_question_txt = null
        args.match_project_id = null
        args.user_confirm = undefined
    } else {
        args.match_question_id = args.return_question.id
        args.match_question_txt = args.return_question.question
        args.match_project_id = args.return_question.project_id
        args.user_confirm = true
    }
    if (user_confirm !== undefined) {
        args.user_confirm = user_confirm
    }
    if (task_id) {
        args.task_id = 0
    }
    args.return_question = undefined
    let data = await createApi("search_history", schema, null, "eq.").patch(
        args
    )
    return data
}

export default {
    schema,
    service,
}
