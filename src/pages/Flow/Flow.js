import React from "react"
import { Tooltip, Select, Modal, Spin, Popconfirm, Button } from "antd"
import "./Flow.less"
import insertCss from "insert-css"
import "./iconfont.css"
import schema from "@/schemas/intent"
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
import { ExclamationCircleOutlined } from "@ant-design/icons"

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
            selectCell: "",
            expGraphData: {},
        }
        this.deleteNode = this.deleteNode.bind(this)
    }

    getIntent = async () => {
        const { record } = this.props
        const res = await schema.service.get({
            limit: 1000,
            key: "not.eq.null",
            domain_key: record.domain_key,
        })
        let list = getTree(res.list)
        this.setState({ intenList: list })
    }
    getHistory = async () => {
        const { record } = this.props
        const res = await schema.service.getFlowHistory({
            limit: 1000,
            flow_key: record.key,
            config: "not.is.null",
            domain_key: record.domain_key,
        })
        this.setState({ historyList: res.list })
    }

    bindKey() {
        let method = null
        let key

        key = "ctrl + z"
        method = (e) => {
            e.preventDefault()
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
        this.getData()
        await this.getIntent()
        await this.getHistory()
        this.setState({
            spinning: false,
        })
        this.graph.flowSetting = {
            key: record.key,
            domain_key: record.domain_key,
        }
        this.bindKey()
        const container = document.getElementById("containerChart")
        const ports = container.querySelectorAll(".x6-port-body")
        showPorts(ports, false)
    }

    render() {
        let { chooseType, cell, intenList, expGraphData, spinning } = this.state
        const { service, record, dict, other } = this.props
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
                                    <i className="iconfont icon-square" />
                                </div>
                            </Tooltip>
                            <Tooltip title="结束节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("end", e)
                                    }
                                >
                                    <img
                                        style={{ marginTop: "-7px" }}
                                        src={Ellipse}
                                        alt=""
                                    />
                                </div>
                            </Tooltip>
                            <Tooltip title="全局节点" placement="bottom">
                                <div
                                    className="btn"
                                    onMouseDown={(e) =>
                                        this.startDrag("Circle", e)
                                    }
                                >
                                    <i className="iconfont icon-circle" />
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
                        <ZSSelectStyle
                            bordered={false}
                            value={this.state.historyIndex}
                            placeholder={"选择历史版本"}
                            style={{ textAlign: "right", width: "200px" }}
                            onSelect={this.onHistoryChange.bind(this)}
                        >
                            {this.state.historyList &&
                                this.state.historyList.map((item, index) => {
                                    return (
                                        <Option value={index}>
                                            {item.create_time.format(
                                                "YYYY-MM-DD HH:mm:ss"
                                            )}
                                        </Option>
                                    )
                                })}
                        </ZSSelectStyle>
                    </div>
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
                                await service.patch({
                                    ...data,
                                    id: record.id,
                                })
                                localStorage.removeItem("flow" + record.id)
                                this.setState({ spinning: false })
                                this.props.handleSetVisibleFlow(false)
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
                    _this.graph.dispose()
                    _this.initData()
                    _this.getData(_this.state.historyList[index].config)
                    _this.graph.flowSetting = {
                        key: record.key,
                        domain_key: record.domain_key,
                    }
                    _this.setState({
                        historyIndex: index,
                    })
                },
                onCancel() {
                    console.log("Cancel")
                },
            })
        } else {
            _this.graph.dispose()
            _this.initData()
            _this.getData(_this.state.historyList[index].config)
            _this.graph.flowSetting = {
                key: record.key,
                domain_key: record.domain_key,
            }
            _this.setState({
                historyIndex: index,
            })
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
            // let res = await service.getDetail({
            //     id: record.id,
            // })
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
                            allow_repeat_time: 2,
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
                        allow_repeat_time: 2,
                        type: "begin",
                        position: {
                            x: 369,
                            y: 161,
                        },
                    },
                ]
            }
        }
        data.node.map((item) => {
            this.addNodes(item)
        })
        data.connection.map((item) => {
            this.addEdges(item)
        })

        this.graph.action = data.action
        this.graph.condition = data.condition
        this.setState({
            expGraphData: data,
        })
    }

    addNodes(args) {
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
                action: args.action,
                types: args.type,
            },
            attrs: {
                label: {
                    text: args.name,
                    fill: "#000000",
                    fontSize: 14,
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
                    stroke: "#000000",
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

    addEdges(args) {
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
                allow_repeat_time: 2,
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

    validateConnection(sourceView, targetView, sourceMagnet, targetMagnet) {
        if (
            targetMagnet &&
            targetMagnet.getAttribute("port-group") === "bottom"
        ) {
            return false
        }
        if (sourceView === targetView) {
            return false
        }
        let isTrue = true
        if (targetView && sourceView) {
            this.state.expGraphData.connection.map((item) => {
                if (
                    item.end === targetView.cell.id &&
                    item.begin === sourceView.cell.id
                ) {
                    isTrue = false
                }
            })
        }
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
            args.added.forEach((cell) => {
                this.selectCell = cell
                if (cell.isEdge()) {
                    cell.isEdge() && cell.attr("line/strokeDasharray", 5)
                }
            })
            args.removed.forEach((cell) => {
                cell.isEdge() && cell.attr("line/strokeDasharray", 0)
            })
        })
        this.graph.on("edge:mouseup", (args) => {
            if (!args.view.targetView) {
                const id = uuidv4()
                this.graph.addNode({
                    id,
                    width: 110,
                    height: 50,
                    position: { x: args.x, y: args.y },
                    data: {
                        name: "未命名",
                        allow_repeat_time: 2,
                    },
                    attrs: {
                        label: {
                            text: "未命名",
                            fill: "#000000",
                            fontSize: 14,
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
        if (!this.graph) {
            return
        }
        console.log("数据改变")
        const expGraph = this.graph
        let data = {
            node: [],
            connection: [],
            condition: [],
            action: [],
        }
        expGraph.getNodes().map((item, index) => {
            let nodeData = item.getData()
            let itemData = {
                name: nodeData.name,
                key: item.id,
                action: nodeData.action,
                allow_repeat_time: nodeData.allow_repeat_time,
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
                    action.push(oneAction)
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
                    condition.push(oneCondition)
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
