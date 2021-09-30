import React, { useState } from "react"
import { Input, Form, Button, Select, Divider, TreeSelect } from "antd"
import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"
import { v4 as uuidv4 } from "uuid"

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
                initialValues={initialValues}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
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
                <Form.Item label="槽位" name={"slot"}>
                    <div style={{ width: "489px" }}>
                        <AceEditor
                            placeholder={`请输入${"槽位"}`}
                            mode="json"
                            // theme="tomorrow"
                            name="blah2"
                            wrapEnabled={true}
                            onChange={(res) => {
                                const obj = {}
                                obj["slot"] = res
                                try {
                                    formRef.current.setFieldsValue({
                                        slot: undefined,
                                    })
                                    formRef.current.setFieldsValue({
                                        slot: JSON.parse(res),
                                    })
                                } catch (error) {
                                    console.log(error)
                                }
                            }}
                            fontSize={14}
                            showPrintMargin
                            showGutter
                            width={"489px"}
                            // style={props.style}
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
