import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import moment from "moment"
import { Tooltip } from "antd"
import { isNull } from "lodash"

const schema = {
    create_time: {
        title: "查询时间",
        sorter: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
    search: {
        title: "查询文本",
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
    user_confirm: {
        title: "是否解决问题",
        type: schemaFieldType.Select,
        dict: {
            true: {
                value: true,
                remark: "是",
            },
            false: {
                value: false,
                remark: "否",
            },
        },
        render: (item) => {
            if (item === null) {
                return "未确认"
            } else {
                return item
            }
        },
    },
    have_match_project_id: {
        title: "匹配情况",
        type: schemaFieldType.Select,
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
    task_id: {
        title: "处理状态",
        type: schemaFieldType.Select,
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
            console.log(data)
            console.log(typeof item)
            if (data.task_id === null) {
                return "无处理"
            } else {
                return "有处理"
            }
        },
    },
    match_project_id: {
        title: "匹配库",
        required: true,
        type: schemaFieldType.Select,
    },
    match_question_txt: {
        title: "匹配问题",
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
}

const service = createApi("search_history", schema, null)

service.get = async (args) => {
    if (args.create_time) {
        let beginTime = moment(args.create_time.split(",")[0]).format(
            "YYYY-MM-DDTHH:mm:ss"
        )
        let endTime = moment(args.create_time.split(",")[1]).format(
            "YYYY-MM-DDTHH:mm:ss"
        )
        args.create_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
    }
    if (args.have_match_project_id) {
        if (args.have_match_project_id === "have") {
            args.match_project_id = "not.is.null"
        }
        if (args.have_match_project_id === "notHave") {
            args.match_project_id = "is.null"
        }
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
    let data = await createApi("search_history", schema, null, "eq.").get(args)
    return data
}

service.patch = async (args, user_confirm) => {
    if (!args.return_question) {
        args.match_question_id = null
        args.match_question_txt = null
        args.match_project_id = null
        args.user_confirm = false
    } else {
        args.match_question_id = args.return_question.id
        args.match_question_txt = args.return_question.question
        args.match_project_id = args.return_question.project_id
        args.user_confirm = true
    }
    if (user_confirm) {
        args.user_confirm = user_confirm
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
