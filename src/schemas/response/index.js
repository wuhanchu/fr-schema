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
        extra: "域中的唯一编码,可用中文。初始化好了以后，请不要随意修改。",
    },
    intent_key: {
        title: "意图",
        type: schemaFieldType.MultiSelect,
        style: { width: "500px" },
        search: false,
        extra: "需要回复回应的对应意图。",
    },
    expect_entity_scope: {
        title: "实体范围",
        sorter: true,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
        searchPrefix: "like",
        extra: "当前回应返回后，希望客户选择配置的实体范围。",
    },
    instruction: {
        title: "指令",
        searchPrefix: "like",
    },
    template_text: {
        title: "回复文本",
        hideInTable: true,
        type: schemaFieldType.TextArea,
        style: { width: "500px" },
        search: false,
        props: {
            autoSize: { minRows: 3, maxRows: 6 },
        },
        extra: "可配置多个，会按照顺序进行回复。",
        render: (item) => (
            <span>
                {item &&
                    (item.toString().length > 20
                        ? item.toString().substr(0, 20)
                        : item.toString())}
            </span>
        ),
    },
    // todo 需要附带 模版说明格式
    buttons: {
        title: "按钮",
        hideInTable: true,
        props: {
            style: { width: "500px" },
            height: "400px",
        },
        search: false,
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
            // showTime: true,
            // valueType: "dateTime",
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
