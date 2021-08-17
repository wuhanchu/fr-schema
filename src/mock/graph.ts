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

        codeName: "source_11111",
        allow_repeat_time: 1,
        catId: 1,
        nodeDefId: 111111,
        category: "source",
        status: 3,
        groupId: 0,

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
        codeName: "source_11111",
        catId: 1,
        allow_repeat_time: 1,
        nodeDefId: 111111,
        category: "source",
        status: 3,
        groupId: 0,
    }
}

export const queryGraph = (id: string) => {
    return {
        lang: "zh_CN",
        success: true,
        data: initData,
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
            codeName: "source_11111",
            catId: 1,
            types: "begin",
            nodeDefId: 111111,
            category: "source",
            allow_repeat_time: 1,
            status: 3,
            action: ["action_1", "action_2"],
            groupId: 0,
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
            codeName: "source_11111",
            catId: 1,
            nodeDefId: 111111,
            category: "source",
            allow_repeat_time: 1,
            status: 3,
            groupId: 0,
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
