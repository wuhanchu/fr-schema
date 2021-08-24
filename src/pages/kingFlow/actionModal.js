import React, { useState, useEffect } from "react"
import { Input, Form, Button, Select } from "antd"
import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"

// import 'brace/mode/json';//
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"

import FormItem from "antd/lib/form/FormItem"
const { OptGroup } = Select

function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

export const ActionModal = ({
    visible,
    handleVisible,
    actionType,
    actions,
    defaultValue,
    graph,
    cell,
    handleChangeShowAction,
    graphChange,
}) => {
    const [form] = Form.useForm()

    const expGraph = graph
    let initialValues = clone(defaultValue)
    let actionList = []
    if (cell.getData && cell.getData().action) {
        actionList = cell.getData().action
    }

    const onFinish = (values) => {
        let myActions = clone(actions)
        if (actionType === "add") {
            let actionKey = cell.id + `${Date.now()}`
            myActions.push({
                ...values,
                key: actionKey,
            })
            actionList.push(actionKey)
            cell.setData({ action: actionList })
            let expGraphAction = [...graph.action]
            expGraphAction.push({
                ...values,
                key: actionKey,
            })
            graph.action = expGraphAction
            graphChange()
        } else {
            if (expGraph.action) {
                let arr = expGraph.action.map((item) => {
                    if (item.key === defaultValue.key) {
                        return { ...values, key: defaultValue.key }
                    }
                    return item
                })
                expGraph.action = arr
                graphChange()
            }
        }
        handleVisible(false)
        handleChangeShowAction()
    }

    const [importData, setImportData] = useState([])
    if (initialValues["param"]) {
        var [AceEditorValue, setAceEditorValue] = useState(
            JSON.stringify(initialValues["param"], null, "\t")
        )
    } else {
        var [AceEditorValue, setAceEditorValue] = useState("")
    }

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo)
    }

    const dict = {
        phone_play_audio: {
            value: "phone_play_audio",
            remark: "对接电话播放音频",
        },
        phone_play_tts_audio: {
            value: "phone_play_tts_audio",
            remark: "对接电话播放语音合成音频",
        },
        search: {
            value: "search",
            remark: "搜索知识库",
        },
        transfer_manual: {
            value: "transfer_manual",
            remark: "转人工",
        },
        response: {
            value: "response",
            remark: "返回生成文本",
        },
        get_question_by_global_key: {
            value: "get_question_by_global_key",
            remark: "根据全局key获取问题",
        },
        rasa_model_slot_set: {
            value: "rasa_model_slot_set",
            remark: "使用rasa 默认设置槽位方法获取槽位",
        },
        get_template: {
            value: "get_template",
            remark: "根据回复key搜索回复模板",
        },
        self_income_expenses_get_response: {
            value: "self_income_expenses_get_response",
            remark: "自有收支核算流程根据槽位搜索回复模板",
        },
        self_income_expenses_search_entity: {
            value: "self_income_expenses_search_entity",
            remark: "根据输入相似查询 想关联的实体",
        },
        self_income_expenses_balance_action: {
            value: "self_income_expenses_balance_action",
            remark: "根据不平的方向返回结果",
        },
    }
    let formRef = React.createRef()

    let options = []
    Object.keys(dict).forEach((key) => {
        options.push(
            <Select.Option value={key}>{dict[key].remark}</Select.Option>
        )
    })
    const onValuesChange = (value) => {
        if (value.type) {
            formRef.current.setFieldsValue({ name: dict[value.type].remark })
        }
    }

    console.log(expGraph)

    useEffect(() => {
        if (
            formRef &&
            formRef.current &&
            formRef.current.getFieldsValue()["param"]
        ) {
            if (typeof formRef.current.getFieldsValue()["param"] === "object") {
                setAceEditorValue(
                    JSON.stringify(
                        formRef.current.getFieldsValue()["param"],
                        null,
                        "\t"
                    )
                )
            } else {
                setAceEditorValue(formRef.current.getFieldsValue()["param"])
            }
        }
    }, [importData])
    // 定义json 初始化值

    return (
        <Modal
            title={"行为配置"}
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
                {actionType === "add" && (
                    <Form.Item label="引用">
                        <Select
                            placeholder="请选择引用"
                            style={{ width: "100%" }}
                            onChange={(key) => {
                                const importData = expGraph.action.filter(
                                    (item) => item.key == key
                                )[0]
                                formRef.current.setFieldsValue(importData)
                                setImportData(importData)
                                initialValues["param"] = importData.param
                            }}
                        >
                            {expGraph.action &&
                                expGraph.action.map((item) => {
                                    return (
                                        <Select.Option value={item.key}>
                                            {item.name}
                                        </Select.Option>
                                    )
                                })}
                        </Select>
                    </Form.Item>
                )}
                <Form.Item
                    label="类型"
                    name="type"
                    rules={[{ required: true, message: "请输入类型！" }]}
                >
                    <Select placeholder="请选择类型" style={{ width: "100%" }}>
                        {options}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: "请输入名称！" }]}
                >
                    <Input
                        placeholder={"请输入名称"}
                        defaultValue={initialValues.name}
                    />
                </Form.Item>
                <Form.Item label="参数" name={"param"}>
                    <div style={{ width: "489px" }}>
                        <AceEditor
                            placeholder={`请输入${"参数"}`}
                            mode="json"
                            // theme="tomorrow"
                            name="blah2"
                            wrapEnabled={true}
                            onChange={(res) => {
                                const obj = {}
                                obj["param"] = res
                                try {
                                    formRef.current.setFieldsValue({
                                        param: JSON.parse(res),
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
                <Form.Item wrapperCol={{ offset: 10, span: 12 }}>
                    <Button
                        style={{ float: "right" }}
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
