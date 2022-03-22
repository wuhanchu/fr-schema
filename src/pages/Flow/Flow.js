import React from "react"
import { Tooltip, Select, Modal, Spin, Popconfirm, Button, message } from "antd"
import "./Flow.less"
import insertCss from "insert-css"
import "./iconfont.css"
import schema from "@/schemas/intent"
import flowSchema from "@/schemas/flow"

import { v4 as uuidv4 } from "uuid"
import styled from "styled-components"
import {
    ports,
    createEdgeFunc,
    initGraph,
    isError,
    getTree,
    startDragToGraph,
    showPorts,
} from "./methods"
import clone from "clone"
import keyboardJS from "keyboardjs"
import Ellipse from "./ellipse.svg"
import RightDrawer from "./RightDrawer"
import { ExclamationCircleOutlined, CloseOutlined } from "@ant-design/icons"

const { Option } = Select
const { confirm } = Modal

const ZSSelectStyle = styled(Select)`
    .ant-select-selection-placeholder {
        color: #000;
    }
`

class Flow extends React.PureComponent {
    keyBindMethods = []

    constructor(props) {
        super(props)
        this.state = {
            chooseType: "grid",
            spinning: true,
            currentArrow: 3,
            cell: undefined,
            zoom: 1,
            selectCell: "",
            expGraphData: {},
        }
        this.deleteNode = this.deleteNode.bind(this)
    }

    getIntent = async () => {
        const { record, other } = this.props
        console.time("getData")

        let base_domain_key =
            other.dict.domain[record.domain_key].base_domain_key || []
        const res = await schema.service.get({
            limit: 1000,
            key: "not.eq.null",

            domain_key: [record.domain_key, ...base_domain_key].join(","),
        })
        console.timeEnd("getData")

        let list = res.list.filter((item) => {
            if (
                item.domain_key === record.domain_key ||
                (base_domain_key &&
                    base_domain_key.indexOf(item.domain_key) > -1)
            ) {
                return true
            } else {
                return false
            }
        })
        // console.timeEnd("getData")

        console.timeEnd("create")

        list = getTree(clone(list), other.dict.domain)
        this.setState({ intenList: [] })
    }

    getFlow = async () => {
        const { record, other } = this.props
        let base_domain_key =
            other.dict.domain[record.domain_key].base_domain_key
        const res = await flowSchema.service.get({
            limit: 1000,
            // domain_key: record.domain_key,
        })
        let list = res.list.map((item) => {
            return {
                ...item,
                key: item.domain_key + item.key,
                label: item.name,
                value: item.key,
            }
        })
        list = list.filter((item) => {
            if (item.id === record.id) {
                return false
            }
            if (
                item.domain_key === record.domain_key ||
                (base_domain_key &&
                    base_domain_key.indexOf(item.domain_key) > -1)
            ) {
                return true
            } else {
                return false
            }
        })
        this.setState({ flowList: list })
    }

    getHistory = async () => {
        const { record } = this.props
        const res = await schema.service.getFlowHistory({
            limit: 15,
            flow_key: record.key,
            // config: "not.is.null",
            domain_key: record.domain_key,
        })
        this.setState({ historyList: res.list })
    }

    bindKey() {
        let method = null
        let key

        key = "ctrl + c"
        method = (e) => {
            e.preventDefault()
            this.copyNode()
        }
        keyboardJS.bind(key, method)
        this.keyBindMethods.push({
            key,
            method,
        })

        key = "ctrl + z"
        method = (e) => {
            e.preventDefault()
            console.log("撤销")
            this.undoOperate()
        }
        keyboardJS.bind(key, method)
        this.keyBindMethods.push({
            key,
            method,
        })

        key = "delete"
        method = (e) => {
            e.preventDefault()
            this.deleteNode()
        }
        keyboardJS.bind(key, method)
        this.keyBindMethods.push({
            key,
            method,
        })

        key = "ctrl + v"
        method = (e) => {
            e.preventDefault()
            this.pasteNode()
        }
        keyboardJS.bind(key, method)
        this.keyBindMethods.push({
            key,
            method,
        })

        key = "ctrl + shift + z"
        method = (e) => {
            e.preventDefault()
            this.redoOperate()
        }
        keyboardJS.bind(key, method)
        this.keyBindMethods.push({
            key,
            method,
        })
    }

    componentWillUnmount = () => {
        this.keyBindMethods.forEach(({ key, method }) => {
            keyboardJS.unbind(key, method)
        })
    }

    async componentDidMount() {
        const { record } = this.props
        await this.initData()
        await this.getData()
        this.getIntent()
        this.getHistory()
        this.setState({
            spinning: false,
        })
        this.graph.flowSetting = {
            key: record.key,
            domain_key: record.domain_key,
        }
        this.bindKey()
        this.getFlow()
        try {
            const container = document.getElementById("containerChart")
            const ports = container.querySelectorAll(".x6-port-body")
            showPorts(ports, false)
        } catch (error) {}
    }

    handleZoom(isZoom) {
        if (isZoom) {
            if (this.state.zoom < 5) {
                this.graph.zoom(0.1)
                this.setState({ zoom: this.state.zoom + 1 })
            }
        } else {
            if (this.state.zoom > -4) {
                this.graph.zoom(-0.1)
                this.setState({ zoom: this.state.zoom - 1 })
            }
        }
    }

    render() {
        let { chooseType, cell, intenList, expGraphData, spinning } = this.state
        const {
            service,
            record,
            dict,
            other,
            projectDict,
            intentDict,
        } = this.props
        let haveEnd = false
        expGraphData &&
            expGraphData.node &&
            expGraphData.node.map((item) => {
                if (item.type === "end") {
                    haveEnd = true
                }
            })

        return (
            <Spin tip="加载中..." spinning={spinning}>
                <div className="container_warp">
                    <div id="containerChart" />
                    {chooseType && (
                        <RightDrawer
                            flowList={this.state.flowList}
                            projectDict={projectDict}
                            intentDict={intentDict}
                            service={service}
                            record={record}
                            intenList={intenList}
                            other={other}
                            dict={dict}
                            graphChange={() => {
                                return this.graphChange()
                            }}
                            handleSetVisibleFlow={(args) => {
                                this.props.handleSetVisibleFlow(args)
                            }}
                            cell={cell}
                            expGraphData={this.state.expGraphData}
                            onDeleteNode={this.deleteNode}
                            selectCell={this.selectCell}
                            chooseType={chooseType}
                            graph={this.graph}
                            setChooseType={(args) => {
                                this.setState({ chooseType: args })
                            }}
                            changeGridBack={this.onChangeGridBack}
                        />
                    )}
                    <div className="operating">
                        <div className="btn-group">
                            <Tooltip title="普通节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("Rect", e)
                                    }
                                >
                                    <span
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            marginBottom: "-2px",
                                            border: "rgba(0,0,0,0.5) 1px solid",
                                            display: "inline-block",
                                        }}
                                    ></span>
                                </div>
                            </Tooltip>

                            <Tooltip title="主干节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("Master", e)
                                    }
                                >
                                    <span
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            marginBottom: "-2px",
                                            border: "#ad6800 1px solid",
                                            display: "inline-block",
                                        }}
                                    ></span>
                                </div>
                            </Tooltip>
                            <Tooltip title="流程节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("Flow", e)
                                    }
                                >
                                    <span
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            marginBottom: "-2px",
                                            border: "#5b8c00 1px solid",
                                            display: "inline-block",
                                        }}
                                    ></span>
                                </div>
                            </Tooltip>
                            <Tooltip title="结束节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("end", e)
                                    }
                                >
                                    {/* <i className="iconfont icon-circle" /> */}
                                    <span
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            marginBottom: "-2px",
                                            border: "rgba(0,0,0,0.5) 1px solid",
                                            display: "inline-block",
                                            borderRadius: "5px",
                                        }}
                                    ></span>
                                </div>
                            </Tooltip>
                            <Tooltip title="全局节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("Circle", e)
                                    }
                                >
                                    <img
                                        style={{ marginTop: "-7px" }}
                                        src={Ellipse}
                                        alt=""
                                    />
                                </div>
                            </Tooltip>
                        </div>

                        <div className="btn-group">
                            <Tooltip title="删除" placement="bottom">
                                <div
                                    className="btn"
                                    style={{ marginTop: "5px" }}
                                    onClick={(_) => this.deleteNode()}
                                >
                                    <i className="iconfont icon-shanchu" />
                                </div>
                            </Tooltip>
                            <Tooltip title="放大" placement="bottom">
                                <img
                                    src={require("@/assets/add.png")}
                                    style={styles.undo}
                                    alt=""
                                    onClick={(_) => this.handleZoom(true)}
                                />
                            </Tooltip>
                            <Tooltip title="缩小" placement="bottom">
                                <img
                                    src={require("@/assets/reduce.png")}
                                    style={styles.undo}
                                    alt=""
                                    onClick={(_) => this.handleZoom(false)}
                                />
                            </Tooltip>
                            <Tooltip title="撤销" placement="bottom">
                                <img
                                    src={require("@/assets/undo.png")}
                                    style={styles.undo}
                                    alt=""
                                    onClick={(_) => this.undoOperate()}
                                />
                            </Tooltip>
                            <Tooltip title="重做" placement="bottom">
                                <img
                                    src={require("@/assets/redo.png")}
                                    style={styles.redo}
                                    alt=""
                                    onClick={(_) => this.redoOperate()}
                                />
                            </Tooltip>
                        </div>
                    </div>
                    <div className="operating-right">
                        {/* <>历史数据加载中...</> */}
                        <ZSSelectStyle
                            bordered={false}
                            loading={!this.state.historyList}
                            value={this.state.historyIndex}
                            placeholder={"选择历史版本"}
                            notFoundContent={"数据加载中..."}
                            style={{
                                textAlign: "right",
                                width: "200px",
                                right: "30px",
                            }}
                            onSelect={this.onHistoryChange.bind(this)}
                        >
                            {this.state.historyList &&
                                this.state.historyList.map((item, index) => {
                                    return (
                                        <Option value={index} key={index}>
                                            {item.create_time.format(
                                                "YYYY-MM-DD HH:mm:ss"
                                            )}
                                        </Option>
                                    )
                                })}
                        </ZSSelectStyle>
                    </div>
                    {/* <div><CloseOutlined></CloseOutlined></div> */}
                </div>
                <div className="operation">
                    <Popconfirm
                        title={
                            haveEnd ? (
                                "是否提交修改?"
                            ) : (
                                <span style={{ color: "#f5222d" }}>
                                    暂无结束节点，是否提交
                                </span>
                            )
                        }
                        onConfirm={async () => {
                            let data = this.graphChange()
                            if (isError(data, this.graph)) {
                                this.setState({ spinning: true })
                                try {
                                    await service.patch({
                                        ...data,
                                        id: record.id,
                                    })
                                    localStorage.removeItem("flow" + record.id)
                                    this.setState({ spinning: false })
                                    this.props.handleSetVisibleFlow(false)
                                } catch (error) {
                                    message.error(error.message)
                                    this.setState({ spinning: false })
                                }
                            }
                        }}
                        okText="是"
                        cancelText="否"
                    >
                        <Button
                            type="primary"
                            style={{
                                position: "absolute",
                                right: "0px",
                                bottom: "-2px",
                            }}
                        >
                            提交
                        </Button>
                    </Popconfirm>
                </div>
            </Spin>
        )
    }

    async changHistory(index) {
        let _this = this

        const { record } = this.props

        _this.setState({ spinning: true })
        localStorage.removeItem("flowCreate" + record.id)
        localStorage.removeItem("flow" + record.id)

        _this.graph.dispose()
        await _this.initData()
        await _this.getData(_this.state.historyList[index].config)
        _this.graph.flowSetting = {
            key: record.key,
            domain_key: record.domain_key,
        }
        _this.setState({
            historyIndex: index,
            spinning: false,
        })
    }

    onHistoryChange(index) {
        let _this = this
        const { record } = this.props
        let data = localStorage.getItem("flow" + record.id)
        if (data) {
            confirm({
                title: "是否切换版本？",
                icon: <ExclamationCircleOutlined />,
                content: "切换版本会丢失本地缓存数据，请先提交保存，是否继续。",
                okText: "确定",
                cancelText: "取消",
                onOk() {
                    _this.changHistory(index)
                },
                onCancel() {
                    console.log("Cancel")
                },
            })
        } else {
            _this.changHistory(index)
        }
    }

    getData = async (config) => {
        const { record, service } = this.props
        let _this = this
        let res = await service.getDetail({
            id: record.id,
        })

        let data
        let localFlowCreateTime = parseInt(
            localStorage.getItem("flowCreate" + record.id)
        )
        if (config) {
            data = clone(config)
        } else {
            data = localStorage.getItem("flow" + record.id)
            data = JSON.parse(data)
        }
        if (
            !data ||
            localFlowCreateTime < (res.update_time && res.update_time.valueOf())
        ) {
            localStorage.setItem(
                "flowCreate" + this.props.record.id,
                (res.update_time && res.update_time.valueOf()) ||
                    res.create_time.valueOf()
            )

            if (res.config && res.config.node && res.config.node.length) {
                data = res.config
            } else {
                data = {
                    node: [
                        {
                            name: "开始节点",
                            key: uuidv4(),
                            allow_repeat_time: 5,
                            skip_repeat_action: false,
                            type: "begin",
                            position: {
                                x: 369,
                                y: 161,
                            },
                        },
                    ],
                    condition: [],
                    action: [],
                    connection: [],
                }
            }
        } else {
            if (!data.node.length) {
                data.node = [
                    {
                        name: "开始节点",
                        key: uuidv4(),
                        allow_repeat_time: 5,
                        skip_repeat_action: false,
                        type: "begin",
                        position: {
                            x: 369,
                            y: 161,
                        },
                    },
                ]
            }
        }
        let cells = []
        console.time("data")

        data.node.map((item) => {
            // this.addNodes(item)
            cells.push(this.getNodes(item))
        })
        data.connection.map((item) => {
            // this.addEdges(item)
            cells.push(this.getEdges(item))
        })
        console.timeEnd("data")
        console.time("create")
        this.graph.fromJSON({ cells })

        this.graph.action = data.action
        this.graph.condition = data.condition
        this.setState({
            expGraphData: data,
        })
    }

    addNodes(args) {
        let skip_repeat_action
        if (args.skip_repeat_action === undefined) {
            skip_repeat_action = false
        } else {
            skip_repeat_action = args.skip_repeat_action
        }
        this.graph.addNode({
            id: args.key,
            width: 110,
            height: 50,
            shape: args.type === "global" ? "ellipse" : args.shape,
            position: {
                x: args.position ? args.position.x : 300,
                y: args.position ? args.position.y : 300,
            },
            data: {
                key: args.key,
                name: args.name,
                allow_repeat_time: args.allow_repeat_time,
                skip_repeat_action: skip_repeat_action,
                flow_key: args.flow_key,
                action: args.action,
                types: args.type,
            },
            attrs: {
                label: {
                    text: args.name,
                    fill: "#000000",
                    fontSize: 15,
                    textWrap: {
                        width: -10,
                        height: -10,
                        ellipsis: true,
                    },
                },
                body: {
                    rx:
                        args.type === "begin" || args.type === "end"
                            ? 20
                            : undefined,
                    stroke:
                        args.type === "master"
                            ? "#ad6800"
                            : args.type === "flow"
                            ? "#5b8c00"
                            : "#000000",

                    strokeWidth: 1,
                    fill: "#ffffff",
                },
            },
            ports:
                args.type === "end"
                    ? {
                          ...ports,
                          items: [
                              {
                                  id: "port1",
                                  group: "top",
                              },
                              {
                                  id: "port3",
                                  group: "left",
                              },
                              {
                                  id: "port4",
                                  group: "right",
                              },
                          ],
                      }
                    : args.type !== "begin" && args.type !== "global"
                    ? ports
                    : {
                          ...ports,
                          items: [
                              {
                                  id: "port2",
                                  group: "bottom",
                              },
                              {
                                  id: "port3",
                                  group: "left",
                              },
                              {
                                  id: "port4",
                                  group: "right",
                              },
                          ],
                      },
        })
        return args.key
    }

    getNodes(args) {
        let skip_repeat_action
        if (args.skip_repeat_action === undefined) {
            skip_repeat_action = false
        } else {
            skip_repeat_action = args.skip_repeat_action
        }
        let node = {
            id: args.key,
            width: 110,
            height: 50,
            size: {
                width: 110,
                height: 50,
            },
            shape: args.type === "global" ? "ellipse" : args.shape || "rect",
            position: {
                x: args.position ? args.position.x : 300,
                y: args.position ? args.position.y : 300,
            },
            data: {
                key: args.key,
                name: args.name,
                allow_repeat_time: args.allow_repeat_time,
                skip_repeat_action: skip_repeat_action,
                flow_key: args.flow_key,
                action: args.action,
                types: args.type,
            },
            attrs: {
                label: {
                    text: args.name,
                    fill: "#000000",
                    fontSize: 15,
                    textWrap: {
                        width: -10,
                        height: -10,
                        ellipsis: true,
                    },
                },
                body: {
                    rx:
                        args.type === "begin" || args.type === "end"
                            ? 20
                            : undefined,
                    stroke:
                        args.type === "master"
                            ? "#ad6800"
                            : args.type === "flow"
                            ? "#5b8c00"
                            : "#000000",

                    strokeWidth: 1,
                    fill: "#ffffff",
                },
            },
            ports:
                args.type === "end"
                    ? {
                          ...ports,
                          items: [
                              {
                                  id: "port1",
                                  group: "top",
                              },
                              {
                                  id: "port3",
                                  group: "left",
                              },
                              {
                                  id: "port4",
                                  group: "right",
                              },
                          ],
                      }
                    : args.type !== "begin" && args.type !== "global"
                    ? ports
                    : {
                          ...ports,
                          items: [
                              {
                                  id: "port2",
                                  group: "bottom",
                              },
                              {
                                  id: "port3",
                                  group: "left",
                              },
                              {
                                  id: "port4",
                                  group: "right",
                              },
                          ],
                      },
        }
        return node
    }

    addEdges(args) {
        let edges
        if (args.begin) {
            let edge = createEdgeFunc({
                id: args.key,
                data: { ...args },
                source: { cell: args.begin, port: args.beginPort || "port2" },
                target: { cell: args.end, port: args.endPort || "port1" },
            })
            this.graph.addEdge(edge)
        } else {
            let endNode = this.graph.getCellById(args.end)
            let key = uuidv4()
            this.addNodes({
                key,
                name: "全局节点",
                action: [],
                shape: "ellipse",
                type: "global",
                allow_repeat_time: 5,
                skip_repeat_action: false,
                position: {
                    x: endNode.store.data.position.x,
                    y: endNode.store.data.position.y - 150,
                },
            })
            let edge = createEdgeFunc({
                id: args.key,
                data: { ...args },
                source: { cell: key, port: args.beginPort || "port2" },
                target: { cell: args.end, port: "port1" },
            })

            this.graph.addEdge(edge)
        }
    }

    getEdges(args) {
        let edges
        if (args.begin) {
            let edge = {
                id: args.key,
                attrs: {
                    line: {
                        stroke: "#1890ff",
                        strokeWidth: 1,
                        targetMarker: false,
                        style: {
                            animation: "ant-line 30s infinite linear",
                        },
                    },
                },
                data: { ...args },
                source: { cell: args.begin, port: args.beginPort || "port2" },
                target: { cell: args.end, port: args.endPort || "port1" },
                connector: "normal",
                // position:{
                //     "distance": -50
                // },
                router: {
                    name: "manhattan",
                },
                shape: "edge",
                tools: {
                    items: [
                        {
                            name: "source-arrowhead",
                            args: {
                                tagName: "circle",
                                attrs: {
                                    r: 2,
                                    fill: "#1890ff",
                                    stroke: "#1890ff",
                                    "stroke-width": 2,
                                    cursor: "move",
                                },
                            },
                        },
                        {
                            name: "target-arrowhead",
                            args: {
                                tagName: "path",
                                attrs: {
                                    d: "M -5 -4 5 0 -5 4 Z",
                                    fill: "#1890ff",
                                    stroke: "#1890ff",
                                    cursor: "move",
                                },
                            },
                        },
                    ],
                },

                labels: [
                    {
                        attrs: {
                            text: {
                                text: args.name,
                                fontSize: 15,
                                zIndex: 1000,
                                fill: "#000000A6",
                            },
                            body: {
                                fill: "#00000000",
                            },
                        },
                        position: args.lablesPosition || {
                            distance: -70,
                        },
                    },
                ],
                zIndex: 0,
            }
            edges = edge
        } else {
            let endNode = this.graph.getCellById(args.end)
            let key = uuidv4()
            this.addNodes({
                key,
                name: "全局节点",
                action: [],
                shape: "ellipse",
                type: "global",
                allow_repeat_time: 5,
                skip_repeat_action: false,
                position: {
                    x: endNode.store.data.position.x,
                    y: endNode.store.data.position.y - 150,
                },
            })
            let edge = {
                id: args.key,
                data: { ...args },
                zIndex: 0,
                source: { cell: key, port: args.beginPort || "port2" },
                target: { cell: args.end, port: "port1" },
                connector: "normal",
                // position:{
                //     "distance": -50
                // },
                router: {
                    name: "manhattan",
                },
                shape: "edge",
                attrs: {
                    line: {
                        stroke: "#1890ff",
                        strokeWidth: 1,
                        targetMarker: false,
                        style: {
                            animation: "ant-line 30s infinite linear",
                        },
                    },
                },
                tools: {
                    items: [
                        {
                            name: "source-arrowhead",
                            args: {
                                tagName: "circle",
                                attrs: {
                                    r: 2,
                                    fill: "#1890ff",
                                    stroke: "#1890ff",
                                    "stroke-width": 2,
                                    cursor: "move",
                                },
                            },
                        },
                        {
                            name: "target-arrowhead",
                            args: {
                                tagName: "path",
                                attrs: {
                                    d: "M -5 -4 5 0 -5 4 Z",
                                    fill: "#1890ff",
                                    stroke: "#1890ff",
                                    cursor: "move",
                                },
                            },
                        },
                    ],
                },
                labels: [
                    {
                        attrs: {
                            text: {
                                text: args.name,
                                fontSize: 15,
                                zIndex: 1000,
                                fill: "#000000A6",
                            },
                            body: {
                                fill: "#00000000",
                            },
                        },
                        position: args.lablesPosition || {
                            distance: -70,
                        },
                    },
                ],
            }
            edges = edge
        }
        return edges
    }

    validateConnection(sourceView, targetView, sourceMagnet, targetMagnet) {
        if (
            targetMagnet &&
            targetMagnet.getAttribute("port-group") === "bottom"
        ) {
            return false
        }
        // if (sourceView === targetView) {
        //     return false
        // }
        let isTrue = true
        // if (targetView && sourceView) {
        //     this.state.expGraphData.connection.map((item) => {
        //         if (
        //             item.end === targetView.cell.id &&
        //             item.begin === sourceView.cell.id
        //         ) {
        //             isTrue = false
        //         }
        //     })
        // }
        return isTrue
    }

    async initData() {
        this.graph = initGraph(
            this.state.expGraphData,
            this.validateConnection.bind(this),
            this.graphChange.bind(this)
        )
        insertCss(`
              @keyframes ant-line {
                to {
                    stroke-dashoffset: -1000
                }
              }
            `)
        this.graph.on("blank:click", () => {
            this.setState({ chooseType: "grid" })
        })
        this.graph.on("cell:click", ({ cell }) => {
            this.setState({
                chooseType: "",
            })
            this.setState({
                chooseType: cell.isNode() ? "node" : "edge",
                cell: cell,
            })
        })
        this.graph.on("selection:changed", (args) => {
            try {
                args.added.forEach((cell) => {
                    this.selectCell = cell
                    if (cell.isEdge()) {
                        cell.isEdge() &&
                            cell.attr("line/strokeDasharray", 5, {
                                ignoreHistory: true,
                            })
                        cell.isEdge() &&
                            cell.attr("line/stroke", "#199999", {
                                ignoreHistory: true,
                            })
                        cell.isEdge() &&
                            cell.attr("line/strokeWidth", 2.5, {
                                ignoreHistory: true,
                            })
                        // cell.removeTools({ ignoreHistory: true })
                    }
                })
                args.removed.forEach((cell) => {
                    cell.isEdge() &&
                        cell.attr("line/strokeDasharray", 0, {
                            ignoreHistory: true,
                        })
                    cell.isEdge() &&
                        cell.attr("line/stroke", "#1890ff", {
                            ignoreHistory: true,
                        })
                    cell.isEdge() &&
                        cell.attr("line/strokeWidth", 1, {
                            ignoreHistory: true,
                        })
                    // cell.removeTools({ ignoreHistory: true })
                })
            } catch (error) {}
        })
        this.graph.on("edge:mouseup", (args) => {
            try {
                if (!args.view.targetView) {
                    const id = uuidv4()
                    this.graph.addNode({
                        id,
                        width: 110,
                        height: 50,
                        position: { x: args.x, y: args.y },
                        data: {
                            name: "未命名",
                            allow_repeat_time: 5,
                            skip_repeat_action: false,
                            types: "normal",
                        },
                        attrs: {
                            label: {
                                text: "未命名",
                                fill: "#000000",
                                fontSize: 15,
                                textWrap: {
                                    width: -10,
                                    height: -10,
                                    ellipsis: true,
                                },
                            },
                            body: {
                                stroke: "#000000",
                                strokeWidth: 1,
                                fill: "#ffffff",
                            },
                        },
                        ports: ports,
                    })
                    args.edge.getTargetPortId = () => {
                        return "port1"
                    }
                    args.edge.source = args.edge.store.data.source
                    args.edge.target = { cell: id, port: "port1" }
                    this.onConnectNode({
                        edge: args.edge,
                        currentCell: this.graph.getCellById(id),
                    })
                }
            } catch (error) {}
        })

        this.graph.on("cell:changed", (args) => {
            this.graphChange(args)
        })

        this.graph.on("cell:changed", (args) => {
            this.graphChange(args)
        })
    }

    // 得到数据
    graphChange(args) {
        if (!this.graph || this.state.spinning) {
            return
        }
        const expGraph = this.graph
        let data = {
            node: [],
            connection: [],
            condition: [],
            action: [],
        }
        expGraph.getNodes().map((item, index) => {
            let nodeData = item.getData()
            let skip_repeat_action
            if (nodeData.skip_repeat_action === undefined) {
                skip_repeat_action = false
            } else {
                skip_repeat_action = nodeData.skip_repeat_action
            }
            let itemData = {
                name: nodeData.name,
                key: item.id,
                action: nodeData.action,
                allow_repeat_time: nodeData.allow_repeat_time,
                skip_repeat_action: skip_repeat_action,
                domain_key: this.props.record.domain_key,
                flow_key: nodeData.flow_key,
                type: nodeData.types,
                position: {
                    x: item.store.data.position.x,
                    y: item.store.data.position.y,
                },
            }
            data.node.push(itemData)
        })

        expGraph.getEdges().map((item, index) => {
            let nodeData = item.getData()
            let begin = item.store.data.source.cell
            if (!nodeData) {
                nodeData = {}
            }
            let itemData = {
                begin: begin,
                beginPort: item.store.data.source.port,
                endPort: item.store.data.target.port,
                key: item.id,
                domain_key: this.props.record.domain_key,
                end: item.store.data.target.cell,
                name: nodeData.name,
                lablesPosition: item.store.data.labels[0].position,
                condition: nodeData.condition,
            }
            data.connection.push(itemData)
        })

        let action = []
        expGraph.action &&
            expGraph.action.map((oneAction) => {
                let isHave = false
                expGraph.getNodes().map((item, index) => {
                    let nodeData = item.getData()
                    if (
                        nodeData.action &&
                        nodeData.action.indexOf(oneAction.key) > -1
                    ) {
                        isHave = true
                    }
                })
                if (isHave) {
                    action.push({
                        ...oneAction,
                        domain_key: this.props.record.domain_key,
                    })
                }
            })

        let condition = []
        expGraph.condition &&
            expGraph.condition.map((oneCondition) => {
                let isHave = false
                expGraph.getEdges().map((item, index) => {
                    let nodeData = item.getData()
                    if (
                        nodeData.condition &&
                        nodeData.condition.indexOf(oneCondition.key) > -1
                    ) {
                        isHave = true
                    }
                })
                if (isHave) {
                    condition.push({
                        priority: 99,
                        ...oneCondition,
                        domain_key: this.props.record.domain_key,
                    })
                }
            })
        data.action = action
        data.condition = condition
        this.setState({
            expGraphData: data,
        })
        localStorage.setItem(
            "flow" + this.props.record.id,
            JSON.stringify(data)
        )
        return { config: data, ...expGraph.flowSetting }
    }

    // 链接节点
    async onConnectNode(args) {
        const { edge = {}, isNew } = args
        const { source, target } = edge
        const node = args.currentCell
        const portId = edge.getTargetPortId()
        if (node && portId) {
            node.setPortProp(portId, "connected", true)
            const data = {
                source: source.cell,
                target: target.cell,
                outputPortId: source.port,
                inputPortId: target.port,
            }
            edge.setData(data)
        }
        return { success: true }
    }

    // 是否显示 链接桩
    showPorts(ports, show) {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
            ports[i].style.visibility = show ? "visible" : "hidden"
        }
    }

    // 拖拽生成正方形或者圆形
    startDrag(type, e) {
        startDragToGraph(this.graph, type, e, this.graphChange.bind(this))
    }

    // 删除节点
    deleteNode() {
        const cell = this.graph.getSelectedCells()
        if (cell && cell[0] && cell[0].getData().types !== "begin") {
            this.graph.removeCells(cell)
            this.setState({ chooseType: "grid" })
            this.graphChange()
        }
    }

    copyNode() {
        const cell = this.graph.getSelectedCells()
        if (cell && cell[0] && cell[0].getData().types !== "begin") {
            if (cell && cell.length) {
                this.graph.copy(cell, this.options)
                message.success("复制成功")
            } else {
                message.info("请先选中节点再复制")
            }
            this.setState({ chooseType: "grid" })
            this.graphChange()
        }
    }

    pasteNode() {
        if (this.graph.isClipboardEmpty()) {
            message.info("剪切板为空，不可粘贴")
        } else {
            const cells = this.graph.paste(this.options)
            this.graph.cleanSelection()
            this.graph.select(cells)
            message.success("粘贴成功")
        }
    }

    // 撤销
    undoOperate() {
        this.graph.history.undo()
        this.graphChange()
    }

    // 重做
    redoOperate() {
        this.graph.history.redo()
        this.graphChange()
    }
}

const styles = {
    undo: {
        width: "20px",
        height: "20px",
        marginRight: "12px",
        marginTop: "-8px",
    },
    redo: {
        width: "20px",
        height: "20px",
        marginTop: "-8px",
    },
}

export default Flow
