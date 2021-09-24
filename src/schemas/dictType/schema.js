import moment from "moment"
import React from "react"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

export default {
    key: {
        title: "键值",
    },
    name: {
        title: "名称",
    },

    remark: {
        title: "备注",
        sorter: true,

        type: schemaFieldType.TextArea,
    },
    create_time: {
        title: "创建时间",
        sorter: true,
        addHide: true,
        editHide: true,
        render: (item) => {
            if (!item) {
                return <></>
            }
            return <>{moment(item).format("YYYY-MM-DD HH:mm:ss")}</>
        },
    },
}
