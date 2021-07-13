import { createApi } from "@/outter/fr-schema/src/service"

import { schemaFieldType } from "@/outter/fr-schema/src/schema"

let service = createApi("intent")

export default {
    service,
    schema: {
        answer_type: {
            title: "意图类型",
            props: {
                style: {
                    width: 180
                }
            },
            type: schemaFieldType.Select,
            dict: {
                any: {
                    value: 0,
                    remark: "任意"
                },
                sure: {
                    value: 1,
                    remark: "肯定"
                },
                deny: {
                    value: 2,
                    remark: "否定"
                },
                custom: {
                    value: 3,
                    remark: "自定义"
                },
                unknow: {
                    value: 4,
                    remark: "未知"
                }
            }
        },
        name: {
            title: "名称",
            props: {
                style: {
                    width: 180
                }
            },
            infoShowFunc: function(data) {
                return data && data.answer_type === 3
            },
            required: true
        },
        intention_pkgs: {
            title: "意图补充",
            type: schemaFieldType.MultiSelect,
            dict: [],
            props: {
                style: {
                    width: 180
                }
            }
        },
        intention_answers: {
            title: "自定义词条",
            type: schemaFieldType.MultiSelect,
            dict: [],
            props: {
                mode: "tags",
                style: {
                    width: 180
                }
            }
        }
    }
}
