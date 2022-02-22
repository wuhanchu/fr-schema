import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker, Tooltip } from "antd"
import { formatData } from "@/utils/utils"
import moment from "moment"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

function renderText(data) {
    return (
        <Tooltip title={data ? data : ""}>
            <div
                style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "250px", // 宽度250
                }}
            >
                {data && data}
            </div>
        </Tooltip>
    )
}
const schema = {
    flitter_time: {
        title: "时间",
        required: true,
        // search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
            valueType: "dateRange",
        },
        hideInTable: true,
        renderInput: () => <RangePicker style={{ width: "100%" }} />,
        type: schemaFieldType.DatePicker,
    },
    domain_key: {
        title: "域",
        type: schemaFieldType.Select,
    },
    create_time: {
        title: "时间",
        required: true,
        // search: false,
        sorter: true,
        addHide: true,
        editHide: true,
        search: false,
        props: {
            showTime: true,
            valueType: "dateTime",
            // valueType: 'dateRange',
        },
        renderInput: () => <RangePicker style={{ width: "100%" }} />,
        type: schemaFieldType.DatePicker,
    },
    status: {
        title: "状态",
        sorter: true,
        addHide: true,
        editHide: true,
        dict: {
            wait: {
                value: "wait",
                remark: "未处理",
            },
            end: {
                value: "end",
                remark: "已处理",
            },
            deny: {
                value: "deny",
                remark: "已丢弃",
            },
        },
        required: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    project_id: {
        title: "问题库",
        required: true,
        sorter: true,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    calibration_question_text: {
        title: "检测文本",
        required: true,
        search: false,
        render: renderText,
        sorter: true,
    },
    compare_question_text: {
        title: "对比文本",
        search: false,

        required: true,
        render: renderText,
        sorter: true,
    },

    compatibility: {
        title: "匹配度",
        sorter: true,
        search: false,

        render: (item) => {
            return formatData(item, 5)
        },
    },
    // calibration_question_id: {
    //     title: "检测问题编号",
    //     // hideInTable: true,
    //     required: true,
    //     // type: schemaFieldType.Select,
    // },
    calibration_question_standard: {
        title: "检测问题",
        render: renderText,
        search: false,

        sorter: true,
    },
    compare_question_standard: {
        title: "对比问题",
        search: false,

        sorter: true,
        render: renderText,
    },

    question: {
        title: "问题",
        hideInTable: true,
        editHide: true,
        addHide: true,
    },

    // compare_question_id: {
    //     title: "对比问题编号",
    //     // hideInTable: true,
    //     required: true,
    //     // type: schemaFieldType.Select,
    // },
}

export default schema
