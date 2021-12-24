import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker, Tooltip } from "antd"
import moment from "moment"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
const { RangePicker } = DatePicker

const schema = {
    project_id: {
        title: "问题库",
        listHide: true,
        required: true,
        type: schemaFieldType.Select,
    },
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

    text: {
        title: "文本列表",
        style: { width: "500px" },
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
                // <div>
                //     {data &&
                //         data.join(" | ")}
                // </div>
            )
        },
        type: schemaFieldType.TextArea,
    },
}

export default schema
