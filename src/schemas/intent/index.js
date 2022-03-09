import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",

        sorter: true,
        required: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            mode: "tags",
            showSearch: true,
        },
    },
    name: {
        title: "名称",
        searchPrefix: "like",
        sorter: true,
        required: true,
    },

    key: {
        required: true,
        sorter: true,
        title: "编码",
    },

    logical_path: {
        title: "意图路径",
        search: false,
        sorter: true,
        searchPrefix: "not.like",
        required: true,
    },
    regex: {
        title: "正则表达式",
        type: schemaFieldType.Select,
        extra: "建议配置5个字符，2个词汇之内的表达式。",
        hideInTable: true,
        search: false,

        props: {
            mode: "tags",
            allowClear: true,
            showSearch: true,
            dropdownRender: false,
            dropdownStyle: { zIndex: -999 },
        },
    },
    standard_discourse: {
        title: "标准话术",
        type: schemaFieldType.TextArea,
        search: false,

        hideInTable: true,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        // hideInTable: true,
        exportConcat: true,
        extra: "一行一个数据，用于相似度比对，不建议包含重复的相似文本。",
    },
    example: {
        title: "例子",
        search: false,

        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        hideInTable: true,
        exportConcat: true,
        extra: "一行一个数据，用于模型训练，建议包含重复的相似文本",
    },
    create_time: {
        title: "创建时间",
        // required: true,
        search: false,

        sorter: true,
        addHide: true,
        editHide: true,
        hideInTable: true,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("intent", schema, null, "eq.")

service.get = async function (args) {
    args.domain_key = args.domain_key
        ? "in.(" + args.domain_key + ")"
        : undefined

    const res = await createApi("intent", schema, null, "eq.").get(args)
    let list = res.list.map((item) => {
        return {
            ...item,
            tier: item.logical_path ? item.logical_path.split(".").length : 0,
            children: [],
            itemKey: item.domain_key + item.key,
            example: item.example ? item.example.join("\n") : null,
            standard_discourse: item.standard_discourse
                ? item.standard_discourse.join("\n")
                : null,
            regex: item.regex ? item.regex.join("\n") : null,
        }
    })
    return { ...res, list: list }
}

service.getDetail = async function (args) {
    const res = await createApi("intent", schema, null, "eq.").getDetail(args)
    return {
        ...res,
        example: res.example ? res.example.join("\n") : null,
        standard_discourse: res.standard_discourse
            ? res.standard_discourse.join("\n")
            : null,
        // regex: res.regex ? res.regex.join("\n") : null,
    }
}

service.post = async function (args, schema) {
    let example = null
    let standard_discourse = null
    if (args.example) {
        example = args.example.split("\n")
    }
    if (args.standard_discourse) {
        standard_discourse = args.standard_discourse.split("\n")
    }
    const res = await createApi("intent", schema, null, "eq.").post({
        ...args,
        example: example,
        standard_discourse,
        // regex
    })
    return res
}

service.getFlowHistory = createApi("flow_history", schema, null, "eq.").get

service.patch = async function (args, schema) {
    let example = null
    let standard_discourse = null
    if (args.example) {
        example = args.example.split("\n")
    }
    if (args.standard_discourse) {
        standard_discourse = args.standard_discourse.split("\n")
    }
    const res = await createApi("intent", schema, null, "eq.").patch({
        ...args,
        example: example,
        standard_discourse,
    })

    return res
}

service.uploadExcel = createBasicApi("intent/import").post

service.upInsert = createApi(
    "intent?on_conflict=domain_key,key",
    schema,
    null,
    "eq."
).upInsert
service.submit = createApi("intent/correction").upInsert

export default {
    schema,
    service,
}
