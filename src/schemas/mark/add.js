import { createApi } from "@/components/ListPage/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker, Tooltip } from "antd"
import moment from "moment"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

const schema = {
    domain_key: {
        title: "域",
        search: false,
        type: schemaFieldType.Select,
    },
    project_id: {
        title: "问题库",
        hideInTable: true,
        required: true,
        search: false,
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
    },
    begin_time: {
        title: "开始时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
    },

    end_time: {
        title: "结束时间",
        type: schemaFieldType.DatePicker,
        props: {
            format: "YYYY-MM-DD",
            style: { width: "100%" },
            // showTime: true,
            // valueType: "dateTime",
        },
        hideInTable: true,
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
            // showTime: true,
            // valueType: 'dateRange',
            // valueType: "dateTime",
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

    text: {
        title: "文本列表",
        style: { width: "500px" },
        search: false,
        render: (data) => {
            return (
                <Tooltip title={data ? data.join(" | ") : ""}>
                    <div
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "400px",
                        }}
                    >
                        {data && data.join(" | ")}
                    </div>
                </Tooltip>
            )
        },
        type: schemaFieldType.TextArea,
    },
}

export default schema
