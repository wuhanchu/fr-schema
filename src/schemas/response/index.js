import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        style: { width: "500px" },
        addHide: true,
        editHide: true,
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
            allowClear: true,
            showSearch: true,
        },
        search: false,
        // required: true,
        type: schemaFieldType.Select,
    },
    name: {
        title: "名称",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        searchPrefix: "like",
        required: true,
    },
    key: {
        title: "编码",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        searchPrefix: "like",
        required: true,
    },
    intent_key: {
        title: "意图",
        type: schemaFieldType.MultiSelect,
        style: { width: "500px" },
        search: false,
    },
    expect_entity_scope: {
        title: "实体范围",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        searchPrefix: "like",
        extra: "预期实体范围",
        required: true,
    },

    template_text: {
        title: "回复文本",
        type: schemaFieldType.TextArea,
        style: { width: "500px" },
        search: false,
        props: {
            autoSize: { minRows: 3, maxRows: 6 },
        },
        extra: "相关的回复文本，可配置多个，增加回复的多样性。",
        render: (item) => (
            <span>
                {item &&
                    (item.toString().length > 20
                        ? item.toString().substr(0, 20)
                        : item.toString())}
            </span>
        ),
    },
    template: {
        title: "回复模板",
        hideInTable: true,
        props: {
            style: { width: "500px" },
            height: "400px",
        },
        extra: "针对机器闲聊的配置。",
        search: false,

        // // required: true,
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
    },
    create_time: {
        title: "创建时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        search: false,
        props: {
            showTime: true,
            valueType: "dateTime",
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("response", schema, null, "eq.")
service.upInsert = createApi(
    "response?on_conflict=domain_key,key",
    schema,
    null,
    "eq."
).upInsert
export default {
    schema,
    service,
}
