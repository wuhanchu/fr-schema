import React, { useState } from "react"
import {
    Input,
    Form,
    Button,
    Select,
    Divider,
    TreeSelect,
    Tooltip,
    message,
    InputNumber,
} from "antd"
import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { v4 as uuidv4 } from "uuid"
import {
    verifyJson,
    verifyJsonORString,
} from "@/outter/fr-schema-antd-utils/src/utils/component"
import ReactMarkdown from "react-markdown"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"

function initCompleter(actionParam, record) {
    let init_slot = undefined
    let slot = undefined
    if (localStorage.getItem("flow" + record.id + "init_slot")) {
        init_slot = JSON.parse(
            localStorage.getItem("flow" + record.id + "init_slot")
        )
    }
    if (localStorage.getItem("flow" + record.id + "slot")) {
        slot = JSON.parse(localStorage.getItem("flow" + record.id + "slot"))
    }
    let completers = []
    actionParam.map((item) => {
        completers.push({
            name: item.key,
            value: item.key,
            score: 100,
            meta: item.remark,
            require: item.require,
            type: item.type,
            action_type_key: item.action_type_key,
        })
    })
    if (slot) {
        Object.keys(slot).forEach((key) => {
            completers.push({
                name: slot[key].name,
                value: slot[key].value,
                score: 100,
                require: slot[key].require,
                type: slot[key].type,
                meta: slot[key].remark || "",
                remarks: slot[key].remark || "",
            })
        })
    }
    if (init_slot) {
        Object.keys(init_slot).forEach((key) => {
            completers.push({
                name: init_slot[key].value,
                value: init_slot[key].value,
                score: 100,
                require: init_slot[key].require,
                type: init_slot[key].type,
                meta: init_slot[key].remark || "",
                remarks: init_slot[key].remark || "",
            })
        })
    }

    return completers
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
    actionParam,
    record,
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
    let completers = []
    if (record) {
        completers = initCompleter(actionParam, record)
    }
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
    let mdStart =
        "***可选范围***\n" +
        // '*这是倾斜的文字*`\n\n' +
        // '**这是斜体加粗的文字**\n\n' +
        "~~~js\n"
    return (
        <Modal
            title={<div keys={isImport || defaultValue.key}>条件配置</div>}
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
                        extra="复用流程中配置的的条件定义。修改当前信息会同步修改引用对应的信息。"
                    >
                        <Select
                            showSearch
                            defaultValue={defaultImport}
                            allowClear
                            optionFilterProp="children"
                            placeholder="请选择条件"
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
                    label="槽位"
                    extra="JSON格式或者是PYTHON表达式"
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
                            // enableBasicAutocompletion={true}
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
                            onLoad={(editor) => {
                                editor.completers = [
                                    {
                                        getCompletions: function (
                                            editors,
                                            session,
                                            pos,
                                            prefix,
                                            callback
                                        ) {
                                            let completer = completers.filter(
                                                (item) => {
                                                    return item.action_type_key
                                                        ? item.action_type_key ===
                                                              "set_slot"
                                                        : true
                                                }
                                            )
                                            callback(null, completer)
                                        },
                                    },
                                ]
                            }}
                            setOptions={{
                                // enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                // enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                                useWorker: false,
                            }}
                        />
                        <Tooltip
                            placement="rightTop"
                            color={"#444"}
                            overlayStyle={{ width: "460px" }}
                            overlayInnerStyle={{ width: "460px" }}
                            title={
                                <div
                                    className="tooltipTable"
                                    style={{
                                        height: "300px",
                                        overflowY: "auto",
                                    }}
                                >
                                    <table border="0">
                                        <thead>
                                            <tr>
                                                <th>变量</th>
                                                <th>名称</th>
                                                <th>备注</th>
                                                <th>必填</th>
                                                <th>类型</th>
                                            </tr>
                                        </thead>
                                        {completers
                                            .filter((item) => {
                                                if (
                                                    item.action_type_key &&
                                                    item.action_type_key ===
                                                        "set_slot"
                                                ) {
                                                    return true
                                                } else {
                                                    if (!item.action_type_key) {
                                                        return true
                                                    } else {
                                                        return false
                                                    }
                                                }
                                            })
                                            .map((item) => {
                                                return (
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    width:
                                                                        "100px",
                                                                    marginRight:
                                                                        "10px",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width:
                                                                            "100px",
                                                                    }}
                                                                >
                                                                    {item.value}
                                                                </div>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    width:
                                                                        "100px",
                                                                    marginRight:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {item.meta}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    width:
                                                                        "150px",
                                                                }}
                                                            >
                                                                {item.remarks}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    width:
                                                                        "50px",
                                                                }}
                                                            >
                                                                {item.required}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    width:
                                                                        "60px",
                                                                }}
                                                            >
                                                                {item.type}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                )
                                            })}
                                    </table>
                                </div>
                            }
                        >
                            <a
                                style={{
                                    position: "absolute",
                                    right: "-20px",
                                    top: "5px",
                                }}
                            >
                                <QuestionCircleOutlined />
                            </a>
                        </Tooltip>
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
