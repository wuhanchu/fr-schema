import React, { useState } from "react"
import {
    Input,
    Form,
    Button,
    Select,
    Divider,
    Tooltip,
    message,
    Space,
    Table,
} from "antd"

import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import AceEditor from "react-ace"
import { v4 as uuidv4 } from "uuid"
import { verifyJsonORString } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { QuestionCircleOutlined } from "@ant-design/icons"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/mode-python"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"
import { uuid } from "@antv/x6/lib/util/string/uuid"
import { values } from "lodash"
import ReactMarkdown from "react-markdown"
import { listToDict } from "@/outter/fr-schema/src/dict"

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
            meta: item.name || "",
            remarks: item.remark || "",
            require: item.require,
            required: item.require ? "是" : "否",
            type: item.type,
            default: item.default,
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
                required:
                    slot[key].require !== undefined
                        ? slot[key].require
                            ? "是"
                            : "否"
                        : "",
                default: slot[key].default,
                type: slot[key].type,
                meta: slot[key].name || "",
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
                required:
                    init_slot[key].require !== undefined
                        ? init_slot[key].require
                            ? "是"
                            : "否"
                        : "",
                default: init_slot[key].default,
                type: init_slot[key].type,
                meta: init_slot[key].name || "",
                remarks: init_slot[key].remark || "",
            })
        })
    }

    return completers
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
    actionTypeList,
    actionParam,
    record,
}) => {
    let completers = []
    let formRef = React.createRef()

    // console
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

    const dict = actionTypeList
        ? listToDict(actionTypeList, "", "key", "name")
        : {}

    let options = []
    let optionsRemark = []
    Object.keys(dict).forEach((key) => {
        optionsRemark.push(dict[key])
        options.push(
            <Select.Option
                title={dict[key].remark + "(" + dict[key].remarks + ")"}
                label={dict[key].remark}
                value={key}
                key={key}
            >
                <div>
                    <span>{dict[key].remark}</span>
                    <span style={{ color: "#00000060", marginLeft: "3px" }}>
                        {"(" + dict[key].remarks + ")"}
                    </span>
                </div>
                {/* {dict[key].remark } */}
            </Select.Option>
        )
    })
    var [type, setType] = useState(initialValues.type)
    localStorage.setItem("actionType", type)

    if (record) {
        completers = initCompleter(actionParam, record, type)
    }
    const onValuesChange = (value) => {
        if (value.type) {
            formRef.current.setFieldsValue({ name: dict[value.type].remark })
            setType(value.type)
            localStorage.setItem("actionType", value.type)
        }
    }

    let importDict = []
    const columns = [
        {
            title: "变量",
            dataIndex: "value",
            key: "value",
        },
        {
            title: "名称",
            dataIndex: "meta",
            key: "meta",
        },
        {
            title: "备注",
            width: 200,
            dataIndex: "remarks",
            key: "remarks",
        },
        {
            title: "必填",
            width: 50,

            dataIndex: "required",
            key: "required",
        },
        {
            title: "类型",
            width: 60,

            dataIndex: "type",
            key: "type",
        },
    ]

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

    let mdStart =
        "***可选范围***\n" +
        // '*这是倾斜的文字*`\n\n' +
        // '**这是斜体加粗的文字**\n\n' +
        "~~~js\n"

    return (
        <Modal
            title={<div keys={isImport || defaultValue.key}>操作配置</div>}
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
                        <>
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
                                                item.key ===
                                                key.split("nodeID_")[1]
                                        )[0]
                                        formRef.current.setFieldsValue({
                                            param: undefined,
                                        })
                                        formRef.current.setFieldsValue(
                                            importData
                                        )
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
                        </>
                    </Form.Item>
                }
                <Form.Item label="类型">
                    <>
                        <Form.Item
                            // label="类型"
                            name="type"
                            style={{ marginBottom: "0px" }}
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
                            rules={[
                                { required: true, message: "请输入类型！" },
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="请选择类型"
                                style={{ width: "489px" }}
                                optionLabelProp="label"
                                filterOption={(input, option) => {
                                    return (
                                        option.label.indexOf(
                                            input.toLowerCase()
                                        ) >= 0
                                    )
                                }}
                            >
                                {options}
                            </Select>
                        </Form.Item>
                    </>
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
                    <div
                        style={{
                            display: "flex",
                            "justify-content": "space-between",
                        }}
                    >
                        <AceEditor
                            placeholder={`请输入${"参数"}`}
                            mode="python"
                            name="blah2"
                            wrapEnabled={true}
                            onChange={(res) => {
                                const obj = {}
                                console.log(type)
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
                                            let type = localStorage.getItem(
                                                "actionType"
                                            )
                                            let completer = completers.filter(
                                                (item) => {
                                                    return item.action_type_key
                                                        ? item.action_type_key ===
                                                              type
                                                        : true
                                                }
                                            )
                                            console.log(completer)
                                            callback(null, completer)
                                        },
                                    },
                                ]
                            }}
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
                                                <th>默认</th>
                                            </tr>
                                        </thead>
                                        {completers
                                            .filter((item) => {
                                                let type = localStorage.getItem(
                                                    "actionType"
                                                )
                                                if (
                                                    item.action_type_key &&
                                                    item.action_type_key ===
                                                        type
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
                                                            <td
                                                                style={{
                                                                    width:
                                                                        "60px",
                                                                }}
                                                            >
                                                                {item.default}
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
