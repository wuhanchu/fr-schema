import { createApi } from "@/outter/fr-schema/src/service"

import { schemaFieldType } from "@/outter/fr-schema/src/schema"

let service = createApi("flow_node")
service.get = () => {
    return {
        list: [
            {
                id: "12345-1234-123-12-123",
                name: "再见!",
                type: 2,
                x: 410,
                y: 550,
            },
            {
                id: "12345-1234-123-12-1",
                name: "开始",
                type: 2,
                x: 410,
                y: 250,
            },
            {
                id: "12345-1234-123-12-12",
                name: "对不起，打错了",
                x: 410,
                y: 400,
                type: 2,
                intentions: [
                    {
                        answer_type: 2,
                        id: "12345-1234-123-12-112",
                        source: "12345-1234-123-12-1",
                        target: "12345-1234-123-12-12",
                        node_id: "12345-1234-123-12-1",
                        to_node_id: "12345-1234-123-12-12",
                        type: 1,
                    },
                    {
                        answer_type: 1,
                        id: "12345-1234-123-12-113",
                        source: "12345-1234-123-12-123",
                        target: "12345-1234-123-12-12",
                        node_id: "12345-1234-123-12-12",
                        to_node_id: "12345-1234-123-12-123",
                        type: 1,
                    },
                ],
            },
        ],
    }
}
service.getDetail = () => {
    return [
        { id: "12345-1234-123-12-123", name: "肯定", type: 3 },
        { id: "12345-1234-123-12-1", name: "肯定", type: 2 },
        {
            id: "12345-1234-123-12-12",
            name: "否定",
            type: 1,
            intentions: [
                {
                    answer_type: 2,
                    id: "12345-1234-123-12-112",
                    node_id: "12345-1234-123-12-1",
                    source: "12345-1234-123-12-1",
                    target: "12345-1234-123-12-12",
                    to_node_id: "12345-1234-123-12-12",
                    type: 1,
                },
                {
                    answer_type: 1,
                    id: "12345-1234-123-12-113",
                    source: "12345-1234-123-12-123",
                    target: "12345-1234-123-12-12",
                    node_id: "12345-1234-123-12-123",
                    to_node_id: "12345-1234-123-12-12",
                    type: 1,
                },
            ],
        },
    ]
}
service.post = () => {
    console.log("post")
    return {
        list: [
            { id: "12345-1234-123-12-123", name: "肯定", type: 3 },
            { id: "12345-1234-123-12-1", name: "肯定", type: 2 },
            {
                id: "12345-1234-123-12-12",
                name: "否定",
                type: 1,
                intentions: [
                    {
                        answer_type: 2,
                        id: "12345-1234-123-12-112",
                        source: "12345-1234-123-12-1",
                        target: "12345-1234-123-12-12",
                        node_id: "12345-1234-123-12-1",
                        to_node_id: "12345-1234-123-12-12",
                        type: 1,
                    },
                    {
                        answer_type: 1,
                        id: "12345-1234-123-12-113",
                        source: "12345-1234-123-12-123",
                        target: "12345-1234-123-12-12",
                        node_id: "12345-1234-123-12-123",
                        to_node_id: "12345-1234-123-12-12",
                        type: 1,
                    },
                ],
            },
        ],
    }
}
export default {
    service,
    schema: {
        type: {
            title: "类型",
            type: schemaFieldType.Select,
            dict: {
                normal: {
                    value: 1,
                    remark: "普通话术",
                    default: true,
                },
                word: {
                    value: 2,
                    remark: "任意回答话术",
                },
                end: {
                    value: 3,
                    remark: " 结束语",
                },
                start: {
                    value: 0,
                    remark: " 开始话术",
                },
            },
            props: {
                style: { width: 180 },
            },
        },
        name: {
            title: "名称",
            props: {
                style: { width: 180 },
            },
        },
        desc: {
            title: "话术内容",
            type: "TextArea",
            props: {
                style: { width: 150, height: 150 },
                autoSize: true,
                value: "123",
            },
        },
    },
}
