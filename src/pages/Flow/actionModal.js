import React, { useState } from "react"
import { Input, Form, Button, Select, Divider, Tooltip, message } from "antd"
import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import AceEditor from "react-ace"
import { v4 as uuidv4 } from "uuid"
import { verifyJsonORString } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { InfoCircleOutlined } from "@ant-design/icons"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/mode-python"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"
import { uuid } from "@antv/x6/lib/util/string/uuid"
import { values } from "lodash"

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
    editor.completers = [
        {
            getCompletions: function (editors, session, pos, prefix, callback) {
                callback(null, completers)
            },
        },
    ]
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
    expGraphData,
    other,
}) => {
    const expGraph = graph
    let initialValues = clone(defaultValue)
    let actionList = []
    if (cell.getData && cell.getData().action) {
        actionList = cell.getData().action
    }
    let isMore = 0
    let defaultImport

    expGraphData.node.map((nodeItem) => {
        nodeItem.action &&
            nodeItem.action.map((item) => {
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
    const onFinish = (values) => {
        if (values.param && typeof values.param !== "object") {
            try {
                values.param = JSON.parse(values.param)
            } catch (error) {
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
        return values
    }

    const newAction = (values) => {
        let myActions = clone(actions)
        if (actionType === "add") {
            let actionKey = uuidv4()
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
                expGraph.action = null

                // console.log(arr)
                expGraph.action = arr
                graphChange()
            }
        }
        handleVisible(false)
        handleChangeShowAction()
    }

    const cloneAction = (values) => {
        let key = defaultValue.key || isImport
        let myActions = clone(actions)
        let actionKey = uuidv4()
        myActions.push({
            ...values,
            key: actionKey,
        })
        if (!isImport) {
            actionList[
                actionList.findIndex((item, index) => {
                    return defaultValue.key === item
                })
            ] = actionKey
        }
        // actionList.push(actionKey)
        cell.setData({ action: actionList })
        let expGraphAction = [...graph.action]
        expGraphAction.push({
            ...values,
            key: actionKey,
        })
        graph.action = expGraphAction
        graphChange()
        handleVisible(false)
        handleChangeShowAction()
    }

    const importAction = (values) => {
        let key = isImport || defaultValue.key
        if (actionType === "edit") {
            actionList[
                actionList.findIndex((item, index) => {
                    return defaultValue.key === item
                })
            ] = isImport
        }
        if (actionType === "add") {
            if (isImport) {
                actionList.push(isImport)
            }
        }
        if (isImport) {
            cell.setData({ action: actionList })
        }
        let arr = expGraph.action.map((item) => {
            if (item.key === key) {
                return { ...values, key: key }
            }
            return item
        })

        expGraph.action = arr
        graphChange()
        handleVisible(false)
        handleChangeShowAction()
    }

    const [importData, setImportData] = useState([])

    if (initialValues["param"]) {
        if (typeof initialValues["param"] === "string") {
            var [AceEditorValue, setAceEditorValue] = useState(
                initialValues["param"]
            )
        } else {
            if (typeof (initialValues["param"] === "object")) {
                var [AceEditorValue, setAceEditorValue] = useState(
                    JSON.stringify(initialValues["param"], null, "\t")
                )
            }
        }
    } else {
        var [AceEditorValue, setAceEditorValue] = useState("")
    }

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo)
    }

    const dict = other.dict.action_type || {}
    let formRef = React.createRef()

    let options = []
    Object.keys(dict).forEach((key) => {
        options.push(
            <Select.Option value={key} key={key}>
                {/* <Tooltip title={dict[key].remarks || ""}>
                    <div style={{ width: "100%" }}>{dict[key].remark}</div>
                </Tooltip> */}
                {dict[key].remark}
            </Select.Option>
        )
    })
    var [type, setType] = useState(initialValues.type)

    const onValuesChange = (value) => {
        if (value.type) {
            formRef.current.setFieldsValue({ name: dict[value.type].remark })
            setType(value.type)
        }
    }

    let importDict = []

    expGraphData.node &&
        expGraphData.node.map((item) => {
            let nodeActionDict = []
            item.action &&
                item.action.map((key) => {
                    let oneNodeAction = expGraph.action.filter(
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
                <Select.OptGroup label={item.name} key={item.name}>
                    {nodeActionDict}
                </Select.OptGroup>
            )
        })

    return (
        <Modal
            title={<div keys={isImport || defaultValue.key}>行为配置</div>}
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
                {
                    <Form.Item
                        label="引用"
                        extra="服用流程中配置的操作定义。修改当前信息会同步修改引用对应的信息。"
                    >
                        <Select
                            showSearch
                            defaultValue={defaultImport}
                            allowClear
                            placeholder="请选择操作"
                            optionFilterProp="children"
                            style={{ width: "100%" }}
                            onChange={(key) => {
                                if (key) {
                                    const importData = expGraph.action.filter(
                                        (item) =>
                                            item.key === key.split("nodeID_")[1]
                                    )[0]
                                    formRef.current.setFieldsValue({
                                        param: undefined,
                                    })
                                    formRef.current.setFieldsValue(importData)
                                    setIsImport(key.split("nodeID_")[1])
                                    setImportData(importData)
                                    setAceEditorValue("")
                                    if (importData.param) {
                                        setAceEditorValue(
                                            JSON.stringify(
                                                importData.param,
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
                    label="类型"
                    name="type"
                    extra={
                        dict[type] && (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html:
                                        dict[type].remarks &&
                                        dict[type].remarks.replace(
                                            /\n/g,
                                            "<br/>"
                                        ),
                                }}
                            />
                        )
                    }
                    rules={[{ required: true, message: "请输入类型！" }]}
                >
                    <Select
                        showSearch
                        placeholder="请选择类型"
                        style={{ width: "100%" }}
                        filterOption={(input, option) =>
                            option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                    >
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
                <Form.Item
                    label="参数"
                    name={"param"}
                    extra="操作的输入参数"
                    rules={verifyJsonORString}
                >
                    <div style={{ width: "489px" }}>
                        <AceEditor
                            placeholder={`请输入${"参数"}`}
                            mode={"json"}
                            // theme="tomorrow"
                            name="blah2"
                            wrapEnabled={true}
                            onChange={(res) => {
                                const obj = {}
                                obj["param"] = res
                                formRef.current.setFieldsValue({
                                    param: res,
                                })
                            }}
                            fontSize={14}
                            showPrintMargin
                            showGutter
                            width={"489px"}
                            height={"200px"}
                            highlightActiveLine
                            enableBasicAutocompletion={true}
                            enableLiveAutocompletion={true}
                            value={AceEditorValue}
                            onLoad={complete}
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
