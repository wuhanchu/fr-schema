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
    create_time: {
        title: "时间",
        required: true,
        sorter: true,
        addHide: true,
        editHide: true,
        props: {
            showTime: true,
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
            ready: {
                value: "0",
                remark: "未处理",
            },
            end: {
                value: 1,
                remark: "已处理",
            },
            deny: {
                value: 2,
                remark: "已丢弃",
            },
        },
        required: true,
        type: schemaFieldType.Select,
    },
    project_id: {
        title: "问题库",
        required: true,
        sorter: true,
        type: schemaFieldType.Select,
    },
    calibration_question_text: {
        title: "检测文本",
        required: true,
        render: renderText,
        sorter: true,
    },
    compare_question_text: {
        title: "对比文本",
        required: true,
        render: renderText,
        sorter: true,
    },

    compatibility: {
        title: "匹配度",
        sorter: true,
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
        sorter: true,
    },
    compare_question_standard: {
        title: "对比问题",
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
