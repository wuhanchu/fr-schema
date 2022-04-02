import { createApi, createBasicApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        addHide: true,
        editHide: true,
        showHide: true,

        search: false,
        sorter: true,
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
        extra: "域中的唯一编码,可用中文。初始化好了以后，请不要随意修改。",
    },
    logical_path: {
        title: "意图路径",
        search: false,
        sorter: true,
        searchPrefix: "not.like",
        required: true,
        extra: "意图的上下级关系设计,下级的意图是上级的子集",
    },
    regex: {
        title: "正则表达式",
        type: schemaFieldType.Select,
        extra: "用于短文本匹配(5个字符内)",
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
        exportConcat: true,
        extra: "用于长文本匹配。一行一个数据，相似的文本无需重复配置。",
    },
    create_time: {
        title: "创建时间",
        search: false,
        sorter: true,
        showHide: true,
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

    // args.select = "id,name,key,logical_path,domain_key"
    console.time("转换")

    const res = await createApi("intent", schema, null, "eq.").get(args)
    console.timeEnd("转换")

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
service.submit = async (args) => {
    return createApi(
        "intent/correction?domain_key=" + args.domain_key
    ).upInsert(args.data)
}

export default {
    schema,
    service,
}
