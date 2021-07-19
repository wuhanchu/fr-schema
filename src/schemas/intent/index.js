import { createApi, createBasicApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        // style: { width: "500px" },
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        // style: { width: "500px" },
        searchPrefix: "like",
        sorter: true,
        required: true,
    },

    example: {
        title: "例子",
        // sorter: true,
        // style: { width: "500px" },
        required: true,
        // type: schemaFieldType.Select,
        // props: {
        //     mode: "tags",
        //     dropdownRender: false,
        //     dropdownStyle: { zIndex: -999 },
        // },
        type: schemaFieldType.TextArea,
        props: {
            autoSize: { minRows: 2, maxRows: 10 },
        },
        // listHide: true,
        exportConcat: true,
        extra: "每行表示一个例子",
    },

    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
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
            example: item.example ? item.example.join("|") : null,
        }
    })
    return { ...res, list: list }
}

service.getDetail = async function (args) {
    const res = await createApi("intent", schema, null, "eq.").getDetail(args)
    return {
        ...res,
        example: res.example ? res.example.join("\n") : null,
    }
}

service.post = async function (args, schema) {
    let example = null
    if (args.example) {
        example = args.example.split("\n")
    }
    const res = await createApi("intent", schema, null, "eq.").post({
        ...args,
        example: example,
    })

    return res
}

service.patch = async function (args, schema) {
    let example = null
    if (args.example) {
        example = args.example.split("\n")
    }
    const res = await createApi("intent", schema, null, "eq.").patch({
        ...args,
        example: example,
    })

    return res
}

service.uploadExcel = createBasicApi("intent/import").post

export default {
    schema,
    service,
}
