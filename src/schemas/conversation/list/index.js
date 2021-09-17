import { createApi } from "@/outter/fr-schema/src/service"
import {schemaFieldType} from "@/outter/fr-schema/src/schema";

const schema = {
    domain_key: {
        title: "域",
        sorter: true,
        required: true,
        type: schemaFieldType.Select,
    },
    user_id: {
        title: "用户编号",
    },
    flow_key: {
        title: "流程",
        type: schemaFieldType.Select,
    },
    status: {
        title: "状态",
        sorter: true,
        dict: {
            end: {
                value: "end",
                remark: "结束",
            }
        }
    },
    create_time: {
        title: "创建时间",
        sorter: true,
        props: {
            showTime: true,
        },
        type: schemaFieldType.DatePicker,
    },
}

const service = createApi("conversation", schema, null, "eq.")

export default {
    schema,
    service,
}
