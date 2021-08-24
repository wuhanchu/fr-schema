import random from "lodash/random"

interface NodeParams {
    name: string
    x: number
    y: number
}

export const copyNode = (props) => {
    const { name, x, y } = props
    const id = `${Date.now()}`
    return {
        name,
        inPorts: [
            {
                tableName: "germany_credit_data",
                sequence: 1,
                description: "输入",
                id: id + 100000,
            },
        ],
        outPorts: [
            {
                tableName: "germany_credit_data",
                sequence: 1,
                description: "输出",
                id: id + 300000,
            },
        ],
        allow_repeat_time: 2,
        ...props,
        id,
        positionX: x + 200 + random(20, false),
        positionY: y + random(10, false),
    }
}
export const addNode = ({ name, x, y, id }: NodeParams) => {
    if (!id) {
        id = `${Date.now()}`
    }
    return {
        id,
        name,
        inPorts: [
            {
                tableName: "germany_credit_data",
                sequence: 2,
                description: "输入",
                id: id + "_in",
            },
        ],
        outPorts: [
            {
                tableName: "germany_credit_data",
                sequence: 1,
                description: "输出",
                id: id + "_out",
            },
        ],
        positionX: x,
        positionY: y,
        allow_repeat_time: 2,
    }
}

export const queryGraph = (id: string) => {
    return {
        lang: "zh_CN",
        success: true,
        data: formatData(),
        Lang: "zh_CN",
    }
}

export const addNodeGroup = async (groupName: string) => {
    return {
        success: true,
        data: {
            group: {
                name: groupName,
                id: Date.now(),
            },
        },
    }
}

const initData = {
    nodes: [
        {
            id: "1603716783816",
            name: "开始节点",
            inPorts: [
                // {
                //     tableName: "germany_credit_data",
                //     sequence: 1,
                //     description: "输入",
                //     id: "1603716783816_in",
                // },
            ],
            outPorts: [
                {
                    tableName: "germany_credit_data",
                    sequence: 1,
                    description: "输出",
                    id: "1603716783816_out",
                },
            ],
            positionX: -369,
            positionY: -300,
            types: "begin",
            allow_repeat_time: 2,
            action: ["action_1", "action_2"],
        },
        {
            id: "1603716786205",
            name: "节点2",
            inPorts: [
                {
                    tableName: "germany_credit_data",
                    sequence: 1,
                    description: "输入",
                    id: "1603716786205_in",
                },
            ],
            outPorts: [
                {
                    tableName: "germany_credit_data",
                    sequence: 1,
                    description: "输出",
                    id: "1603716786205_out",
                },
            ],
            positionX: -369,
            positionY: -161,
            allow_repeat_time: 2,
        },
    ],
    links: [
        {
            source: "1603716783816",
            target: "1603716786205",
            name: "测试数据",
            outputPortId: "1603716783816_out",
            inputPortId: "1603716786205_in",
            condition: ["condition_1"],
        },
    ],
    condition: [
        {
            key: "condition_1",
            name: "条件1",
            intent: "123123",
            node_report_time: 2,
            slot: {
                user: "wuhanchu",
            },
        },
        {
            key: "condition_2",
            name: "条件2",
            intent: "123123",
            node_report_time: 2,
            slot: {
                user: "wuhanchu",
            },
        },
    ],
    action: [
        {
            key: "action_1",
            name: "语音播放",
            type: "phone_play_audio",
            param: {
                file_path: "file_path",
                allow_break: true,
            },
        },
        {
            key: "action_2",
            name: "挂机",
            type: "phone_play_audio",
            param: {
                file_path: "file_path",
                allow_break: true,
            },
        },
    ],
}

let data = {
    node: [
        {
            name: "开始节点",
            key: "1603716783816",
            action: ["action_1", "action_2"],
            allow_repeat_time: 2,
            type: "begin",
            position: {
                x: -369,
                y: -300,
            },
        },
        {
            name: "节点2",
            key: "1603716786205",
            allow_repeat_time: 2,
            position: {
                x: -369,
                y: -161,
            },
        },
    ],
    connection: [
        {
            begin: "1603716783816",
            key: "dfdcc5c5-66c1-4a5e-90dd-40eb6b5d1ae7",
            end: "1603716786205",
            name: "测试数据",
            condition: ["condition_1"],
        },
    ],
    condition: [
        {
            key: "condition_1",
            name: "条件1",
            intent: "123123",
            node_report_time: 2,
            slot: {
                user: "wuhanchu",
            },
        },
        {
            key: "condition_2",
            name: "条件2",
            intent: "123123",
            node_report_time: 2,
            slot: {
                user: "wuhanchu",
            },
        },
    ],
    action: [
        {
            key: "action_1",
            name: "语音播放",
            type: "phone_play_audio",
            param: {
                file_path: "file_path",
                allow_break: true,
            },
        },
        {
            key: "action_2",
            name: "挂机",
            type: "phone_play_audio",
            param: {
                file_path: "file_path",
                allow_break: true,
            },
        },
    ],
}

function formatData() {
    let initData = {
        nodes: [],
        links: [],
        condition: [],
        action: [],
    }
    data.node.map((item) => {
        if (item.type === "begin") {
            initData.nodes.push({
                id: item.key,
                name: item.name,
                inPorts: [],
                outPorts: [
                    {
                        tableName: "germany_credit_data",
                        sequence: 1,
                        description: "输出",
                        id: item.key + "_out",
                    },
                ],
                positionX: item.position.x,
                positionY: item.position.y,
                allow_repeat_time: 2,
                action: item.action,
            })
        } else {
            initData.nodes.push({
                id: item.key,
                name: item.name,
                inPorts: [
                    {
                        tableName: "germany_credit_data",
                        sequence: 1,
                        description: "输入",
                        id: item.key + "_in",
                    },
                ],
                outPorts: [
                    {
                        tableName: "germany_credit_data",
                        sequence: 1,
                        description: "输出",
                        id: item.key + "_out",
                    },
                ],
                positionX: item.position.x,
                positionY: item.position.y,
                allow_repeat_time: 2,
                action: item.action,
            })
        }
    })
    data.connection.map((item) => {
        initData.links.push({
            source: item.begin,
            target: item.end,
            name: item.name,
            id: item.key,
            outputPortId: item.begin + "_out",
            inputPortId: item.end + "_in",
            condition: item.condition,
        })
    })
    initData.condition = data.condition
    initData.action = data.action

    console.log("initData", initData)
    return initData
}
