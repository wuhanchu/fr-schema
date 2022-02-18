import React, { useState } from "react"
import {
    Input,
    Form,
    Button,
    Select,
    Divider,
    TreeSelect,
    message,
    InputNumber,
} from "antd"
import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"
import { v4 as uuidv4 } from "uuid"
import {
    verifyJson,
    verifyJsonORString,
} from "@/outter/fr-schema-antd-utils/src/utils/component"

import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"

// ● skip_execute(true/false)：是否跳过下一个节点的执行。
// ● question_limit: 问题搜索数量。
// 运行时:
// ● new_message(true/false)：当前会话状态中新消息是否被节点执行过
// ● last_master_node：当前会话过程中最后一次停留的主节点
// ● receive_text(list)：会话中接收到的所有文本
// ● reply_text(list)：会话中最后回复的文本
// 结果：
// ● search_result(true/false)：问题库是否返回数据，每次问题库查询重新设置。
// ● repeat_out_of_limit(true/false)：是否有节点操过了重复次数。
// ● user_silent(true/false)：是否静默，每次客户回答重新设置。
// ● user_silent_num：用户连续静默次数
// ● user_interrupt(true/false)：是否打断，每次客户回答重新设置。
// ● user_interrupt_num：用户连续打断次数
// ● tts_play(int)：回复文本tts合成的音频客户聆听秒数
const completers = [
    {
        name: "skip_execute",
        value: "skip_execute",
        score: 100,
        meta: "是否跳过下一个节点的执行",
    },
    {
        name: "question_limit",
        value: "question_limit",
        score: 100,
        meta: "问题搜索数量。",
    },
    {
        name: "new_message",
        value: "new_message",
        score: 100,
        meta: "当前会话状态新消息是否被节点执行",
    },
    {
        name: "last_master_node",
        value: "last_master_node",
        score: 100,
        meta: "当前会话中最后停留主节点",
    },
    {
        name: "receive_text",
        value: "receive_text",
        score: 100,
        meta: "会话中接收到的所有文本",
    },
    {
        name: "reply_text",
        value: "reply_text",
        score: 100,
        meta: "会话中最后回复的文本",
    },
    {
        name: "search_result",
        value: "search_result",
        score: 100,
        meta: "问题库是否返回数据",
    },
    {
        name: "repeat_out_of_limit",
        value: "repeat_out_of_limit",
        score: 100,
        meta: "是否有节点操过了重复次数",
    },
    {
        name: "user_silent",
        value: "user_silent",
        score: 100,
        meta: "是否静默，每次客户回答重新设置",
    },
    {
        name: "user_silent_num",
        value: "user_silent_num",
        score: 100,
        meta: "用户连续静默次数",
    },
    {
        name: "user_interrupt",
        value: "user_interrupt",
        score: 100,
        meta: "是否打断，每次客户回答重新设置",
    },
    {
        name: "user_interrupt_num",
        value: "user_interrupt_num",
        score: 100,
        meta: "用户连续打断次数",
    },
    {
        name: "tts_play",
        value: "tts_play",
        score: 100,
        meta: "回复文本tts合成的音频客户聆听秒数",
    },
]

const complete = (editor) => {
    editor.completers.push({
        getCompletions: function (editors, session, pos, prefix, callback) {
            callback(null, completers)
        },
    })
}

export const ConditionModal = ({
    visible,
    handleVisible,
    conditionType,
    conditions,
    defaultValue,
    graph,
    cell,
    expGraphData,
    intenList,
    handleChangeShowCondition,
    graphChange,
}) => {
    const expGraph = graph
    let condition = []
    if (graph) {
        condition = expGraph.condition
    }
    let initialValues = clone(defaultValue)

    let conditionList = []
    if (cell && cell.getData && cell.getData().condition) {
        conditionList = cell.getData().condition
    }

    const onFinish = (values) => {
        if (values.slot && typeof values.slot !== "object") {
            try {
                values.slot = JSON.parse(values.slot)
            } catch (error) {
                // message.error("json格式错误")
                // return
            }
        }
        if (isMore <= 1 && !isImport) {
            newAction(values)
        }
        if (isMore > 1 && !isImport) {
            cloneAction(values)
        }
        if ((isMore > 1 && isImport) || isImport) {
            importAction(values)
        }
    }

    const newAction = (values) => {
        let myConditions = clone(conditions)
        if (conditionType === "add") {
            let conditionKey = uuidv4()
            myConditions.push({
                ...values,
                key: conditionKey,
            })
            conditionList.push(conditionKey)
            cell.setData({ condition: conditionList })
            let expGraphCondition = [...graph.condition]
            expGraphCondition.push({
                ...values,
                key: conditionKey,
            })
            graph.condition = null
            graph.condition = expGraphCondition
            graphChange()
        } else {
            if (expGraph.condition) {
                let arr = expGraph.condition.map((item) => {
                    if (item.key === defaultValue.key) {
                        return { ...values, key: defaultValue.key }
                    }
                    return item
                })
                myConditions = myConditions.map((item) => {
                    if (item.key === defaultValue.key) {
                        return { ...values, key: defaultValue.key }
                    }
                    return item
                })
                expGraph.condition = arr
                graphChange()
            }
        }

        handleVisible(false)
        handleChangeShowCondition()
    }

    const cloneAction = (values) => {
        let key = defaultValue.key || isImport
        let myConditions = clone(conditions)
        let actionKey = uuidv4()
        myConditions.push({
            ...values,
            key: actionKey,
        })
        if (!isImport) {
            conditionList.splice(
                conditionList.findIndex((item) => {
                    return key === item
                }),
                1
            )
        }
        conditionList.push(actionKey)
        cell.setData({ condition: conditionList })
        let expGraphAction = [...graph.condition]
        expGraphAction.push({
            ...values,
            key: actionKey,
        })
        graph.condition = expGraphAction
        graphChange()
        handleVisible(false)
        handleChangeShowCondition()
    }

    const importAction = (values) => {
        let key = isImport || defaultValue.key

        if (conditionType === "edit") {
            conditionList.splice(
                conditionList.findIndex((item) => {
                    return defaultValue.key === item
                }),
                1
            )
        }
        if (isImport) {
            conditionList.push(isImport)
            cell.setData({ condition: conditionList })
        }
        let arr = expGraph.condition.map((item) => {
            if (item.key === key) {
                return { ...values, key: key }
            }
            return item
        })

        expGraph.condition = arr
        graphChange()
        handleVisible(false)
        handleChangeShowCondition()
    }

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo)
    }

    let formRef = React.createRef()

    const onValuesChange = (value) => {
        if (value.type) {
            formRef.current.setFieldsValue({ name: dict[value.type].remark })
        }
    }

    if (initialValues["slot"]) {
        if (typeof initialValues["slot"] === "string") {
            var [AceEditorValue, setAceEditorValue] = useState(
                initialValues["slot"]
            )
        } else {
            var [AceEditorValue, setAceEditorValue] = useState(
                JSON.stringify(initialValues["slot"], null, "\t")
            )
        }
    } else {
        var [AceEditorValue, setAceEditorValue] = useState("")
    }

    let isMore = 0
    let defaultImport

    expGraphData.connection.map((nodeItem) => {
        nodeItem.condition &&
            nodeItem.condition.map((item) => {
                if (item === defaultValue.key) {
                    isMore = isMore + 1
                    if (isMore > 1) {
                        defaultImport = nodeItem.key + "nodeID_" + item
                    }
                }
            })
    })
    const [isImport, setIsImport] = useState(
        defaultImport && defaultImport.split("nodeID_")[1]
    )
    const [importData, setImportData] = useState([])
    let importDict = []

    expGraphData.connection &&
        expGraphData.connection.map((item) => {
            let nodeActionDict = []
            item.condition &&
                item.condition.map((key) => {
                    let oneNodeAction = expGraph.condition.filter(
                        (items) => items.key === key
                    )[0]
                    oneNodeAction &&
                        nodeActionDict.push(
                            <Select.Option
                                value={item.key + "nodeID_" + oneNodeAction.key}
                                key={item.key + "nodeID_" + oneNodeAction.key}
                            >
                                {oneNodeAction.name}
                            </Select.Option>
                        )
                })
            importDict.push(
                <Select.OptGroup label={item.name} key={item.key}>
                    {nodeActionDict}
                </Select.OptGroup>
            )
        })

    return (
        <Modal
            title={"条件配置"}
            visible={visible}
            destroyOnClose={true}
            width={"700px"}
            footer={false}
            onCancel={() => handleVisible(false)}
        >
            <Form
                name="basic"
                ref={formRef}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                onValuesChange={onValuesChange}
                initialValues={{ priority: 99, ...initialValues }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                {
                    <Form.Item
                        label="引用"
                        extra="可选择流程中其他连线配置的条件定义。"
                    >
                        <Select
                            showSearch
                            defaultValue={defaultImport}
                            allowClear
                            optionFilterProp="children"
                            placeholder="请选择引用"
                            style={{ width: "100%" }}
                            onChange={(key) => {
                                if (key) {
                                    const importData = expGraph.condition.filter(
                                        (item) =>
                                            item.key === key.split("nodeID_")[1]
                                    )[0]
                                    formRef.current.setFieldsValue({
                                        slot: undefined,
                                    })
                                    formRef.current.setFieldsValue(importData)
                                    setIsImport(key.split("nodeID_")[1])
                                    setImportData(importData)
                                    setAceEditorValue("")
                                    if (importData.slot) {
                                        console.log("不是json")
                                        setAceEditorValue(
                                            JSON.stringify(
                                                importData.slot,
                                                null,
                                                "\t"
                                            )
                                        )
                                    } else {
                                        setAceEditorValue("")
                                    }
                                } else {
                                    setIsImport(null)
                                    setImportData([])
                                }
                            }}
                        >
                            {importDict}
                        </Select>
                    </Form.Item>
                }
                <Form.Item
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: "请输入名称！" }]}
                >
                    <Input placeholder={"请输入名称"} />
                </Form.Item>

                <Form.Item
                    label="意图"
                    extra="选择预先定义好的意图进行配置。"
                    name="intent"
                >
                    <TreeSelect
                        showSearch
                        allowClear
                        treeNodeFilterProp="name"
                        style={{ width: "100%" }}
                        placeholder={"请选择意图"}
                        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                        treeData={intenList}
                        treeDefaultExpandAll
                    />
                </Form.Item>
                <Form.Item
                    label="优先级"
                    name="priority"
                    extra="如果同时有多个条件满足时，数字越小越优先。"
                    rules={[{ required: true, message: "请输入优先级！" }]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        max={99}
                        min={0}
                        placeholder={"请输入名称"}
                    />
                </Form.Item>
                <Form.Item
                    label="槽位"
                    name={"slot"}
                    rules={verifyJsonORString}
                >
                    <div style={{ width: "489px" }}>
                        <AceEditor
                            placeholder={`请输入${"槽位"}`}
                            mode="json"
                            name="blah2"
                            wrapEnabled={true}
                            onChange={(res) => {
                                const obj = {}
                                obj["slot"] = res
                                formRef.current.setFieldsValue({
                                    slot: res,
                                })
                            }}
                            fontSize={14}
                            showPrintMargin
                            showGutter
                            width={"489px"}
                            height={"200px"}
                            highlightActiveLine
                            value={AceEditorValue}
                            enableBasicAutocompletion={true}
                            enableLiveAutocompletion={true}
                            markers={[
                                {
                                    startRow: 0,
                                    startCol: 2,
                                    endRow: 1,
                                    endCol: 20,
                                    className: "error-marker",
                                    type: "background",
                                },
                            ]}
                            onLoad={complete}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                                useWorker: false,
                            }}
                        />
                    </div>
                </Form.Item>
                <Divider
                    style={{
                        bottom: "-158px",
                        height: "2px",
                        margin: "0px",
                        marginBottom: "-30px",
                        width: "700px",
                        marginLeft: "-24px",
                    }}
                />

                <Form.Item wrapperCol={{ offset: 10, span: 12 }}>
                    <Button
                        style={{
                            float: "right",
                            bottom: "-38px",
                            right: "-61px",
                        }}
                        type="primary"
                        htmlType="submit"
                    >
                        提交
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}
