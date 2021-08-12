import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import moments from "moment"
import { Radio } from "antd"

const schema = {
    id: {
        title: "编号",
        sorter: true,
    },
    search: {
        title: "搜索内容",
        searchPrefix: "like",
    },

    show_question_txt: {
        title: "匹配文本",
        required: true,
        searchPrefix: "like",
        sorter: true,
    },
    match: {
        title: "是否匹配",
        listHide: true,
        type: schemaFieldType.Select,
        dict: {
            true: {
                value: "true",
                remark: "匹配",
            },
            false: {
                value: "false",
                remark: "不匹配",
            },
        },
    },
}

const service = createApi("search_history", schema, null)

service.get = async (args) => {
    let data = await createApi("search_history", schema, null, "eq.").get(args)
    let { list } = data
    list = list.map((item, index) => {
        if (item.match_question_id) {
            return {
                ...item,
                show_question_txt: item.match_question_txt,
                match: true,
            }
        } else {
            return {
                ...item,
                show_question_txt:
                    item.return_question &&
                    item.return_question[0] &&
                    item.return_question[0].answer,
                match: false,
            }
        }
    })
    return { ...data, list }
}

service.patch = async (args) => {
    console.log(args)
    if (!args.match_question_id && args.match) {
        args.match_project_id =
            args.return_question &&
            args.return_question[0] &&
            args.return_question[0].project_id
                ? args.return_question[0].project_id
                : null
        args.match_question_id =
            args.return_question && args.return_question[0]
                ? args.return_question[0].id
                : null
        args.match_question_txt =
            args.return_question && args.return_question[0]
                ? args.return_question[0].answer
                : null
    }
    if (!args.match) {
        args.match_question_id = null
        args.match_question_txt = null
        args.match_project_id = null
    }

    args.match = undefined
    args.match_remark = undefined
    args.show_question_txt = undefined
    args.user_confirm = true
    let data = await createApi("search_history", schema, null, "eq.").patch(
        args
    )
    return data
}

export default {
    schema,
    service,
}
