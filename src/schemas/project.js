import { createApi } from "@/components/ListPage/service"
import { schemas } from "@/outter/fr-schema-antd-utils/src"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { Tooltip } from "antd"
import { QuestionCircleOutlined } from "@ant-design/icons"

const schema = {
    id: {
        sorter: true,
        title: "编号",
        addHide: true,
        editHide: true,
        search: false,
    },
    domain_key: {
        title: "域",
        search: false,
        addHide: true,
        editHide: true,
        sorter: true,
        type: schemaFieldType.Select,
        required: true,
        props: {
            allowClear: true,
            showSearch: true,
        },
        style: { width: "500px" },
    },
    name: {
        title: "名称",
        sorter: true,
        searchPrefix: "like",
        style: { width: "500px" },
        required: true,
    },
    inside: {
        title: "内部问题库",
        type: schemaFieldType.Select,
        props: {
            allowClear: true,
            showSearch: true,
        },
        required: true,
        style: { width: "500px" },
        dict: {
            true: {
                value: "true",
                remark: "是",
            },
            false: {
                value: "false",
                remark: "否",
                default: true,
            },
        },
        extra: "内部问题库的数据不用于智能提示(一般问题包含变量或者占位符)",
    },
    remark: {
        title: "备注",
        search: false,
        type: schemaFieldType.TextArea,
        style: { width: "500px" },
        props: {
            autoSize: { minRows: 2, maxRows: 6 },
        },
    },
    config: {
        title: "个性化配置",
        search: false,
        hideInTable: true,
        infoRender: (
            <Tooltip
                overlayStyle={{ width: "530px" }}
                overlayInnerStyle={{ width: "530px" }}
                placement="rightTop"
                title={
                    <pre>
                        格式
                        {`
{
  "info_schema": {
	"***": {
	  "dict": {   // 类型为下拉框时必填
		"***": {
		  "value": "***", //值 
		  "remark": "****" //名称
		}
	  },
	  "type": "Select", // 类型 Select下拉框 text 文本框
	  "title": "信息类型", //字段名称
	  "editable": true, // 是否可编辑
	  "isExpand": true, // 是否自定义变量
	  "required": true // 是否必填
	}
  }
}
`}
                    </pre>
                }
            >
                <QuestionCircleOutlined
                    style={{
                        marginLeft: "5px",
                        position: "absolute",
                        right: "120px",
                        top: "10px",
                    }}
                />
            </Tooltip>
        ),
        props: {
            style: { width: "500px" },
            height: "300px",
        },
        type: schemaFieldType.AceEditor,
        decoratorProps: { rules: verifyJson },
        extra: "用于定义当前问题库对应问题的个性化字段",
    },
}

const service = createApi("project", schema, null, "eq.")
service.getDetail = async (args) => {
    let res = await createApi("project", schema, null, "eq.").getDetail(args)
    console.log(res)
    return res
}

service.export = async (args) => {
    const res = await createApi(`project/mark`, schema).post(args)
    return res
}
service.import = async (args) => {
    const res = await createApi(`project/mark/sync`, schema).post(args)
    return res
}
service.getMinioToken = async (args) => {
    const res = await createApi(`file/auth`, schema).post({})
    return res
}

export default {
    schema,
    service,
}
