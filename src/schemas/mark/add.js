import { createApi } from "@/outter/fr-schema/src/service"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { DatePicker } from "antd"
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
                value: 0,
                remark: "准备中",
            },
            end: {
                value: 1,
                remark: "已处理",
            },
            deny: {
                value: 2,
                remark: "已放弃",
            },
        },
        required: true,
        type: schemaFieldType.Select,
    },

    text: {
        title: "文本列表",
        style: { width: "500px" },
        render: (data) => {
            console.log(data)
            return (
                <div>
                    {data &&
                        data.map((item) => {
                            return <div>{item}</div>
                        })}
                </div>
            )
        },
        sorter: true,
        type: schemaFieldType.TextArea,
    },
}

export default schema
