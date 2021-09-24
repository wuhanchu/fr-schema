import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    name: {
        title: "名称",
        searchPrefix: "like",
        sorter: true,
        required: true,
    },

    key: {
        required: true,

        title: "编码",
    },
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
    },
    logical_path: {
        title: "意图路径",
        searchPrefix: "not.like",
    },
    regex: {
        title: "正则表达式",
        type: schemaFieldType.Select,
        listHide: true,
        props: {
            mode: "tags",
            dropdownRender: false,
            dropdownStyle: { zIndex: -999 },
        },
    },
    standard_discourse: {
        title: "标准话术",
        type: schemaFieldType.TextArea,
        listHide: true,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        // listHide: true,
        exportConcat: true,
        extra: "每行表示一个话术",
    },
    example: {
        title: "例子",
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        listHide: true,
        exportConcat: true,
        extra: "每行表示一个例子",
    },
    create_time: {
        title: "创建时间",
        // required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        listHide: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("intent", schema, null, "eq.")

service.get = async function (args) {
    const res = await createApi("intent", schema, null, "eq.").get(args)
    let list = res.list.map((item) => {
        return {
            ...item,
            tier: item.logical_path.split(".").length,
            children: [],
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

service.submit = createApi("intent/correction").upInsert

export default {
    schema,
    service,
}
