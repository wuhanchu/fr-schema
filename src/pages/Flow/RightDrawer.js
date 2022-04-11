import React from "react"
import {
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Tag,
    Select,
    Tooltip,
} from "antd"
import "./RightDrawer.less"
import { handleCFmName } from "./methods"
import {
    CloseOutlined,
    QuestionCircleOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons"
import { verifyJsonORString } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { ActionModal } from "./actionModal"
import { ConditionModal } from "./conditionModal"
import Sortable from "sortablejs/modular/sortable.complete.esm.js"
import { ItemName } from "@/components/item-name"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/mode-python"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"

let FormItem = Form.Item

class RightDrawer extends React.PureComponent {
    formEdge = React.createRef()
    formNode = React.createRef()
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            showAction: [],
            showCondition: [],
            isShow: true,
        }
    }

    render() {
        const {
            visible,
            activationData,
            formType,
            showAction,
            showCondition,
            conditionVisible,
        } = this.state
        const {
            graph,
            cell,
            intenList,
            expGraphData,
            graphChange,
            other,
        } = this.props
        return (
            <div className="drawer_container">
                {this.renderGrid()}
                {this.renderNode()}
                {this.renderEdge()}
                {visible && (
                    <ActionModal
                        actionType={formType}
                        graphChange={() => {
                            graphChange()
                        }}
                        other={other}
                        handleChangeShowAction={() => {
                            this.handleChangeShowAction()
                        }}
                        type={"action"}
                        actions={showAction}
                        expGraphData={expGraphData}
                        cell={cell}
                        visible={visible}
                        graph={graph}
                        defaultValue={activationData || {}}
                        handleVisible={(args) => {
                            this.setState({ visible: args })
                        }}
                        actionTypeList={this.props.actionType}
                        actionParam={this.props.actionParam}
                        record={this.props.record}
                    />
                )}
                {conditionVisible && (
                    <ConditionModal
                        conditionType={formType}
                        expGraphData={expGraphData}
                        graphChange={() => {
                            graphChange()
                        }}
                        intenList={intenList}
                        handleChangeShowCondition={() => {
                            this.handleChangeShowCondition()
                        }}
                        type={"condition"}
                        conditions={showCondition}
                        cell={cell}
                        visible={conditionVisible}
                        graph={graph}
                        defaultValue={activationData || {}}
                        handleVisible={(args) => {
                            this.setState({ conditionVisible: args })
                        }}
                        actionTypeList={this.props.actionType}
                        actionParam={this.props.actionParam}
                        record={this.props.record}
                    />
                )}
            </div>
        )
    }

    handleChangeShowAction() {
        let { chooseType, cell, graph } = this.props
        if (cell) {
            const action = graph && graph.action
            let showAction = []
            if (chooseType === "node") {
                let initialValues = cell && cell.getData()
                initialValues.action &&
                    initialValues.action.map((item, index) => {
                        let filterAction = action.filter((list) => {
                            return list.key === item
                        })
                        if (filterAction && filterAction[0]) {
                            showAction.push(filterAction[0])
                        }
                    })
            }
            this.setState({ showAction })
        }
    }

    handleChangeShowCondition() {
        let { chooseType, cell, graph } = this.props
        if (cell) {
            const condition = graph && graph.condition
            let showCondition = []
            if (chooseType === "edge") {
                let initialValues = cell && cell.getData()
                initialValues.condition &&
                    initialValues.condition.map((item, index) => {
                        let filterAction = condition.filter((list) => {
                            return list.key === item
                        })
                        if (filterAction && filterAction[0]) {
                            showCondition.push(filterAction[0])
                        }
                    })
            }
            this.setState({ showCondition })
        }
    }

    componentDidMount() {
        this.handleChangeShowAction()
        this.handleChangeShowCondition()
        let { chooseType, cell } = this.props
        if (chooseType === "node") {
            var el = document.getElementById("items")
            this.formNode.current.validateFields()
            var sortable =
                el &&
                new Sortable(el, {
                    onEnd: function (/**Event*/ evt) {
                        let nodes = evt.to.childNodes
                        let sortableData = []
                        if (nodes && nodes.length) {
                            for (let i = 0; i < nodes.length; i++) {
                                let key = nodes[i].getAttribute("keys")
                                key && sortableData.push(key)
                            }
                        }
                        cell.setData({
                            action: [...sortableData],
                        })
                    },
                })
        }

        if (chooseType === "edge") {
            this.formEdge.current.validateFields()
        }
    }

    // 删除条件或者行为
    onDelete(item, type) {
        let { cell, graph } = this.props
        let { showAction, showCondition } = this.state
        let data = []
        if (type === "action") {
            data = showAction
        } else {
            data = showCondition
        }
        let myData = []
        let dataList = new Set(data.map((item) => item.key))
        dataList.delete(item.key)
        if (type === "action") {
            cell.setData({ action: null })
            cell.setData({
                action: [...dataList],
            })
        } else {
            cell.setData({ condition: null })
            cell.setData({
                condition: [...dataList],
            })
        }
        dataList &&
            dataList.map((item) => {
                let filterAction = []
                if (type === "action") {
                    filterAction = graph.action.filter(
                        (list) => list.key === item
                    )
                } else {
                    filterAction = graph.condition.filter(
                        (list) => list.key === item
                    )
                }

                if (filterAction && filterAction[0]) {
                    myData.push(filterAction[0])
                }
            })
        if (type === "action") {
            this.setState({
                showAction: myData,
            })
        } else {
            this.setState({
                showCondition: myData,
            })
        }
    }

    renderGrid() {
        let {
            chooseType,
            record,
            graph,
            dict,
            intentDict,
            projectDict,
        } = this.props
        // let init_slot = localStorage.getItem("flow" + record.id + "init_slot")?JSON.stringify(JSON.parse(localStorage.getItem("flow" + record.id + "init_slot")),null, '\t') : ""
        // let slot = localStorage.getItem("flow" + record.id + "slot")?JSON.stringify(JSON.parse(localStorage.getItem("flow" + record.id + "slot")),null, '\t') : ""

        let slot = localStorage.getItem("flow" + record.id + "slot")
        let init_slot = localStorage.getItem("flow" + record.id + "init_slot")

        return (
            chooseType === "grid" && (
                <div>
                    <div className="drawer_title">流程设置</div>
                    <div className="drawer_wrap">
                        <Form
                            labelAlign="left"
                            colon={false}
                            initialValues={{
                                slot: slot,
                                init_slot: init_slot,
                            }}
                            layout="vertical"
                        >
                            <FormItem
                                extra="永远保存在会话中的槽位，不能在流程被修改，但是能被使用。"
                                label={
                                    <div>
                                        全局槽位
                                        <Tooltip
                                            placement="rightTop"
                                            color={"#444"}
                                            overlayStyle={{ width: "300px" }}
                                            overlayInnerStyle={{
                                                width: "300px",
                                            }}
                                            title={
                                                <pre>
                                                    格式
                                                    {`
"name": {
    "name": "***" 槽位名,
    "value": "***" 槽位,
    "remark": "***" 备注,
}
`}
                                                </pre>
                                            }
                                        >
                                            <QuestionCircleOutlined
                                                style={{
                                                    marginLeft: "5px",
                                                    display: "inline-block",
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                }
                                name={"slot"}
                                // extra="全局槽位"
                                rules={verifyJsonORString}
                            >
                                <div style={{ width: "309px" }}>
                                    <AceEditor
                                        placeholder={`请输入${"全局槽位"}`}
                                        mode={"json"}
                                        // theme="tomorrow"
                                        name="blah2"
                                        wrapEnabled={true}
                                        onChange={(res) => {
                                            let isError = false
                                            // try {
                                            //     JSON.parse(res)
                                            // } catch (error) {
                                            //     isError = true
                                            // }
                                            if (res === "" || !isError) {
                                                if (res === "") {
                                                    localStorage.setItem(
                                                        "flow" +
                                                            record.id +
                                                            "slot",
                                                        ""
                                                    )
                                                } else {
                                                    localStorage.setItem(
                                                        "flow" +
                                                            record.id +
                                                            "slot",
                                                        res
                                                    )
                                                }
                                            }
                                        }}
                                        fontSize={14}
                                        showPrintMargin
                                        showGutter
                                        width={"309px"}
                                        height={"230px"}
                                        highlightActiveLine
                                        value={slot}
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
                                            enableSnippets: true,
                                            showLineNumbers: true,
                                            tabSize: 2,
                                            useWorker: false,
                                        }}
                                    />
                                </div>
                            </FormItem>
                            <FormItem
                                label={
                                    <div>
                                        初始化槽位
                                        <Tooltip
                                            placement="rightTop"
                                            color={"#444"}
                                            overlayStyle={{ width: "300px" }}
                                            overlayInnerStyle={{
                                                width: "300px",
                                            }}
                                            title={
                                                <pre>
                                                    格式
                                                    {`
"name": {
    "name": "***" 槽位名,
    "type": "***" 数据类型,
    "value": "***" 数值,
    "remark": "***" 备注,
    "require": true/false 是否必填
}
`}
                                                </pre>
                                            }
                                        >
                                            <QuestionCircleOutlined
                                                style={{
                                                    marginLeft: "5px",
                                                    display: "inline-block",
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                }
                                name={"init_slot"}
                                extra="会话开始时，初始化到会话上下文的槽位，能在流程中被修改。"
                                // extra="初始化槽位"
                                rules={verifyJsonORString}
                            >
                                <div style={{ width: "309px" }}>
                                    <AceEditor
                                        placeholder={`请输入${"初始化槽位"}`}
                                        mode={"json"}
                                        // theme="tomorrow"
                                        name="blah2"
                                        wrapEnabled={true}
                                        onChange={(res) => {
                                            let isError = false
                                            // try {
                                            //     JSON.parse(res)
                                            // } catch (error) {
                                            //     isError = true
                                            // }
                                            if (res === "" || !isError) {
                                                if (res === "") {
                                                    localStorage.setItem(
                                                        "flow" +
                                                            record.id +
                                                            "init_slot",
                                                        ""
                                                    )
                                                } else {
                                                    localStorage.setItem(
                                                        "flow" +
                                                            record.id +
                                                            "init_slot",
                                                        res
                                                    )
                                                }
                                            }
                                        }}
                                        fontSize={14}
                                        showPrintMargin
                                        showGutter
                                        width={"309px"}
                                        height={"230px"}
                                        highlightActiveLine
                                        value={init_slot}
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
                                            enableSnippets: true,
                                            showLineNumbers: true,
                                            tabSize: 2,
                                            useWorker: false,
                                        }}
                                    />
                                </div>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            )
        )
    }

    renderNode() {
        let { chooseType, cell, graph } = this.props
        let { isShow, showAction } = this.state
        let canEditType = false
        graph &&
            graph.getEdges().map((item) => {
                if (cell && cell.id === item.getData().begin) {
                    canEditType = true
                }
            })
        return (
            chooseType === "node" && (
                <div>
                    <div className="drawer_title" keys={cell.id}>
                        节点设置
                    </div>
                    <div className="drawer_wrap">
                        <Form
                            ref={this.formNode}
                            labelAlign="left"
                            colon={false}
                            initialValues={{ ...cell.getData() }}
                            preserve={false}
                            layout="vertical"
                            onValuesChange={(args, data) => {
                                let oldType = cell.getData().types
                                console.log(oldType)
                                cell.setData(args)
                                cell.setAttrs({
                                    label: { text: args.name },
                                })
                                if (args.types) {
                                    if (
                                        oldType === "end" &&
                                        (args.types === "normal" ||
                                            args.types === "master" ||
                                            args.types === "flow")
                                    ) {
                                        graph.batchUpdate("changeType", () => {
                                            cell.attr("body/rx", 0)
                                            cell.addPort({
                                                id: "port2",
                                                group: "bottom",
                                            })
                                        })
                                    } else {
                                        if (
                                            (oldType === "normal" ||
                                                oldType === "master" ||
                                                oldType === "flow") &&
                                            args.types === "end"
                                        ) {
                                            graph.batchUpdate(
                                                "changeType",
                                                () => {
                                                    cell.attr("body/rx", 20)
                                                    cell.removePort({
                                                        id: "port2",
                                                        group: "bottom",
                                                    })
                                                }
                                            )
                                        }
                                    }
                                    if (args.types === "master") {
                                        graph.batchUpdate("changeType", () => {
                                            cell.attr("body/stroke", "#ad6800")
                                        })
                                    } else {
                                        if (args.types === "flow") {
                                            graph.batchUpdate(
                                                "changeType",
                                                () => {
                                                    cell.attr(
                                                        "body/stroke",
                                                        "#5b8c00"
                                                    )
                                                }
                                            )
                                        } else {
                                            graph.batchUpdate(
                                                "changeType",
                                                () => {
                                                    cell.attr(
                                                        "body/stroke",
                                                        "#000000"
                                                    )
                                                }
                                            )
                                        }
                                    }
                                }
                            }}
                        >
                            <FormItem
                                label="名称"
                                name={"name"}
                                rules={[
                                    {
                                        required: true,
                                    },
                                    {
                                        validator: (rules, value, callback) => {
                                            handleCFmName(
                                                rules,
                                                value,
                                                callback,
                                                "node",
                                                graph
                                            )
                                        },
                                    },
                                ]}
                            >
                                <Input placeholder="请输入名称" />
                            </FormItem>
                            <FormItem
                                name={"allow_repeat_time"}
                                label={"允许重复次数"}
                                extra="节点在一次会话中允许执行的次数。"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入允许重复次数！",
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min="1"
                                    placeholder="请输入允许重复次数"
                                />
                            </FormItem>
                            <FormItem
                                name={"skip_repeat_action"}
                                label={"是否跳过行为"}
                                extra="如已执行次数等于允许的执行次数，则跳过。"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入是否跳过行为！",
                                    },
                                ]}
                            >
                                <Select
                                    options={[
                                        {
                                            key: "true",
                                            value: true,
                                            label: "是",
                                        },
                                        {
                                            key: "false",
                                            value: false,
                                            label: "否",
                                        },
                                    ]}
                                ></Select>
                            </FormItem>
                            {cell.getData().types !== "begin" &&
                                cell.getData().types !== "global" && (
                                    <FormItem
                                        name={"types"}
                                        label={"类型"}
                                        rules={[
                                            {
                                                required: true,
                                                message: "请输入类型！",
                                            },
                                        ]}
                                    >
                                        <Select
                                            // disabled={canEditType}
                                            options={
                                                !canEditType
                                                    ? [
                                                          {
                                                              key: "end",
                                                              value: "end",
                                                              label: "结束节点",
                                                          },
                                                          {
                                                              key: "master",
                                                              value: "master",
                                                              label: "主干节点",
                                                          },
                                                          {
                                                              key: "flow",
                                                              value: "flow",
                                                              label: "流程节点",
                                                          },
                                                          {
                                                              key: "normal",
                                                              value: "normal",
                                                              label: "普通节点",
                                                          },
                                                      ]
                                                    : [
                                                          {
                                                              key: "master",
                                                              value: "master",
                                                              label: "主干节点",
                                                          },
                                                          {
                                                              key: "flow",
                                                              value: "flow",
                                                              label: "流程节点",
                                                          },
                                                          {
                                                              key: "normal",
                                                              value: "normal",
                                                              label: "普通节点",
                                                          },
                                                      ]
                                            }
                                        ></Select>
                                    </FormItem>
                                )}

                            {cell.getData().types === "flow" && (
                                <FormItem
                                    name={"flow_key"}
                                    label={"请选择子流程"}
                                    // extra="如已执行次数等于允许的执行次数，则跳过。"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入子流程！",
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="请选择子流程"
                                        options={this.props.flowList}
                                    ></Select>
                                </FormItem>
                            )}
                            {cell.getData().types === "flow" && (
                                <FormItem
                                    name={"skip_begin"}
                                    label={"是否跳过开始节点"}
                                    // extra="如已执行次数等于允许的执行次数，则跳过。"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入是否跳过开始节点",
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="请输入是否跳过开始节点"
                                        options={[
                                            { value: true, label: "是" },
                                            { value: false, label: "否" },
                                        ]}
                                    ></Select>
                                </FormItem>
                            )}
                            <FormItem
                                label={
                                    <div>
                                        操作定义
                                        <Tooltip title="节点相关的处理逻辑，根据配置的顺序进行执行。可以拖动进行排序。">
                                            <QuestionCircleOutlined
                                                style={{ marginLeft: "5px" }}
                                            />
                                        </Tooltip>
                                    </div>
                                }
                            >
                                <ul
                                    style={{ margin: "0", padding: "0" }}
                                    id="items"
                                >
                                    {isShow &&
                                        showAction.map((item) => {
                                            return (
                                                <li
                                                    style={{
                                                        display: "inline-block",
                                                        marginBottom: "5px",
                                                        marginRight: "10px",
                                                    }}
                                                    keys={item.key}
                                                    key={item.key}
                                                >
                                                    <Tag key={item.key + "Tag"}>
                                                        <span
                                                            onClick={() => {
                                                                this.setState({
                                                                    visible: true,
                                                                    activationData: item,
                                                                    formType:
                                                                        "edit",
                                                                })
                                                            }}
                                                        >
                                                            {item.name}
                                                        </span>
                                                        <Popconfirm
                                                            title="是否删除此操作?"
                                                            onConfirm={this.onDelete.bind(
                                                                this,
                                                                item,
                                                                "action"
                                                            )}
                                                            okText="是"
                                                            cancelText="否"
                                                        >
                                                            <CloseOutlined />
                                                        </Popconfirm>
                                                    </Tag>
                                                </li>
                                            )
                                        })}
                                    <Tag
                                        style={{ marginBottom: "5px" }}
                                        onClick={() => {
                                            this.setState({
                                                visible: true,
                                                activationData: {},
                                                formType: "add",
                                            })
                                        }}
                                        color="#2db7f5"
                                    >
                                        +
                                    </Tag>
                                </ul>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            )
        )
    }

    renderEdge() {
        let { chooseType, cell, graph } = this.props
        let { showCondition } = this.state
        return (
            chooseType === "edge" && (
                <div>
                    <div className="drawer_title" keys={cell.id}>
                        连线设置
                    </div>
                    <div className="drawer_wrap">
                        <Form
                            ref={this.formEdge}
                            labelAlign="left"
                            colon={false}
                            initialValues={{ ...cell.getData(), key: cell.key }}
                            layout="vertical"
                            onValuesChange={(args) => {
                                cell.setData(args)
                                cell.setLabels({
                                    attrs: {
                                        text: {
                                            text: args.name,
                                            fontSize: 15,
                                            fill: "#000000A6",
                                        },
                                        body: {
                                            fill: "#00000000",
                                        },
                                    },
                                    position:
                                        cell.store.data.labels[0].position,
                                })
                            }}
                        >
                            <FormItem
                                label="名称"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                    },
                                    {
                                        validator: (rules, value, callback) => {
                                            handleCFmName(
                                                rules,
                                                value,
                                                callback,
                                                "edge",
                                                graph
                                            )
                                        },
                                    },
                                ]}
                            >
                                <Input placeholder="请输入名称" />
                            </FormItem>
                            <FormItem
                                label={
                                    <div>
                                        条件定义
                                        <Tooltip title="条件定义是以或的逻辑进行判断，也就是说有一个条件定义满足就算满足条件。">
                                            <QuestionCircleOutlined
                                                style={{ marginLeft: "5px" }}
                                            />
                                        </Tooltip>
                                    </div>
                                }
                            >
                                <ul style={{ margin: "0", padding: "0" }}>
                                    {showCondition.map((item, index) => {
                                        return (
                                            <li
                                                style={{
                                                    display: "inline-block",
                                                    marginBottom: "5px",
                                                    marginRight: "10px",
                                                }}
                                                key={item.key}
                                            >
                                                <Tag key={item.key + "Tag"}>
                                                    <span
                                                        onClick={() => {
                                                            this.setState({
                                                                conditionVisible: true,
                                                                activationData: item,
                                                                formType:
                                                                    "edit",
                                                            })
                                                        }}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    <Popconfirm
                                                        title="是否删除此条件?"
                                                        onConfirm={this.onDelete.bind(
                                                            this,
                                                            item
                                                        )}
                                                        okText="是"
                                                        cancelText="否"
                                                    >
                                                        <CloseOutlined />
                                                    </Popconfirm>
                                                </Tag>
                                            </li>
                                        )
                                    })}
                                    <Tag
                                        style={{ marginBottom: "5px" }}
                                        onClick={() => {
                                            this.setState({
                                                conditionVisible: true,
                                                activationData: {},
                                                formType: "add",
                                            })
                                        }}
                                        color="#2db7f5"
                                    >
                                        +
                                    </Tag>
                                </ul>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            )
        )
    }
}

export default RightDrawer
