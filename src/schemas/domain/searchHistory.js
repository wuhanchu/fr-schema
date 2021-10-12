import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import moment from "moment"
import { Tooltip } from "antd"

const schema = {
    create_time: {
        title: "查询时间",
        sorter: true,
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
        title: "结果已确认",
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
        console.log(args.create_time.split(","))
        let beginTime = moment(args.create_time.split(",")[0]).format(
            "YYYY-MM-DD"
        )
        let endTime = moment(args.create_time.split(",")[1]).format(
            "YYYY-MM-DD"
        )
        args.create_time = undefined
        args.and = `(create_time.gte.${beginTime},create_time.lte.${endTime})`
    }

    let data = await createApi("search_history", schema, null, "eq.").get(args)
    return data
}

service.patch = async (args) => {
    if (!args.return_question) {
        args.match_question_id = null
        args.match_question_txt = null
        args.match_project_id = null
    } else {
        args.match_question_id = args.return_question.id
        args.match_question_txt = args.return_question.question
        args.match_project_id = args.return_question.project_id
    }
    args.user_confirm = true
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
