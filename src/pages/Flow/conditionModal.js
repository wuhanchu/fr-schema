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
        console.log(isMore, isImport)
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
                    console.log("结果", defaultValue.key, item)
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
        var [AceEditorValue, setAceEditorValue] = useState(
            JSON.stringify(initialValues["slot"], null, "\t")
        )
    } else {
        var [AceEditorValue, setAceEditorValue] = useState("")
    }

    let isMore = 0
    let defaultImport

    expGraphData.connection.map((nodeItem) => {
        console.log("连线", nodeItem)
        nodeItem.condition &&
            nodeItem.condition.map((item) => {
                console.log("意图", item)
                if (item === defaultValue.key) {
                    isMore = isMore + 1
                    if (isMore > 1) {
                        defaultImport = nodeItem.key + "nodeID_" + item
                    }
                }
            })
    })
    console.log(isMore, defaultImport)
    const [isImport, setIsImport] = useState(
        defaultImport && defaultImport.split("nodeID_")[1]
    )
    const [importData, setImportData] = useState([])
    let importDict = []

    expGraphData.connection &&
        expGraphData.connection.map((item) => {
            console.log("线", item)
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
                            >
                                {oneNodeAction.name}
                            </Select.Option>
                        )
                })
            importDict.push(
                <Select.OptGroup label={item.name}>
                    {nodeActionDict}
                </Select.OptGroup>
            )
        })

    console.log(importDict)
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
                        extra="复用已有的条件，数据会保持同步"
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

                <Form.Item label="意图" name="intent">
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
                            height={"300px"}
                            highlightActiveLine
                            value={AceEditorValue}
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
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
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
