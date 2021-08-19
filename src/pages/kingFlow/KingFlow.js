import React from "react"
import { Graph, Shape, FunctionExt, DataUri } from "@antv/x6"
import { Tooltip } from "antd"
import "./kingFlow.less"
import insertCss from "insert-css"
import ReactDOM from "react-dom"
import "./iconfont.css"
import { startDragToGraph } from "./methods"
import schema from "@/schemas/intent"
import { ports } from "./methods"

import RightDrawer from "@/pages/kingFlow/RightDrawer"
import { ConsoleSqlOutlined } from "@ant-design/icons"

const data = {}

class KingFlow extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            chooseType: "grid",
            grid: {
                // 网格设置
                size: 20, // 网格大小 10px
                visible: true, // 渲染网格背景
                type: "mesh",
                args: {
                    color: "#D0D0D0",
                    thickness: 1, // 网格线宽度/网格点大小
                    factor: 10,
                },
            },
            connectEdgeType: {
                //连线方式
                connector: "normal",
                router: {
                    name: "",
                },
            },
            currentArrow: 1,
            cell: undefined,
            selectCell: "",
        }
        this.deleteNode = this.deleteNode.bind(this)
        this.onChangeGridBack = this.onChangeGridBack.bind(this)
    }

    getIntent = async () => {
        let data = await schema.service.get({ limit: 1000 })
        this.setState({ intenList: data.list })
    }

    componentDidMount() {
        this.initData()
        this.getIntent()
    }

    render() {
        let { currentArrow, chooseType, cell, intenList } = this.state
        return (
            <div className="container_warp">
                <div id="containerChart" />
                {chooseType && (
                    <RightDrawer
                        intenList={intenList}
                        graphChange={() => {
                            this.graphChange()
                        }}
                        cell={cell}
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
                        <div
                            className="btn"
                            title="普通节点"
                            onMouseDown={(e) => this.startDrag("Rect", e)}
                        >
                            <i className="iconfont icon-square" />
                        </div>
                        <div
                            className="btn"
                            title="全局节点"
                            onMouseDown={(e) => this.startDrag("Circle", e)}
                        >
                            <i className="iconfont icon-circle" />
                        </div>

                        {/* <div
                            className="btn"
                            title="条件节点"
                            onMouseDown={(e) => this.startDrag("polygon", e)}
                        >
                            <i className="iconfont icon-square rotate-square" />
                        </div> */}
                    </div>
                    <div className="btn-group">
                        <Tooltip title="直线箭头" placement="bottom">
                            <div
                                className={
                                    currentArrow === 1
                                        ? "currentArrow btn"
                                        : "btn"
                                }
                                onClick={(e) =>
                                    this.changeEdgeType(1, "normal")
                                }
                            >
                                <i className="iconfont icon-ai28" />
                            </div>
                        </Tooltip>
                        <Tooltip title="曲线箭头" placement="bottom">
                            <div
                                className={
                                    currentArrow === 2
                                        ? "currentArrow btn"
                                        : "btn"
                                }
                                onClick={(e) =>
                                    this.changeEdgeType(2, "smooth")
                                }
                            >
                                <i className="iconfont icon-Down-Right" />
                            </div>
                        </Tooltip>
                        <Tooltip title="直角箭头" placement="bottom">
                            <div
                                className={
                                    currentArrow === 3
                                        ? "currentArrow btn"
                                        : "btn"
                                }
                                onClick={(e) =>
                                    this.changeEdgeType(3, null, "manhattan")
                                }
                            >
                                <i className="iconfont icon-jiantou" />
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
            </div>
        )
    }

    getData() {
        let data = localStorage.getItem("flow" + this.props.record.id)
        data = JSON.parse(data)
        console.log(data)
        console.log("数据")
        if (!data) {
            data = {
                node: [],
                condition: [],
                action: [],
                connection: [],
            }
        } else {
            if (!data.node.length) {
                data.node = [
                    {
                        name: "开始节点1",
                        key: "1603716783816",
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
    }

    addNodes(args) {
        this.graph.addNode({
            id: args.key,
            width: 100,
            height: 60,
            position: { x: args.position.x, y: args.position.y },
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
                    stroke: "#000000",
                    strokeWidth: 1,
                    fill: "#ffffff",
                },
            },
            ports: ports,
        })
    }

    addEdges(args) {
        let edge = this.createEdgeFunc({
            id: args.key,
            data: { ...args },
            source: { cell: args.begin, port: "port2" },
            target: { cell: args.end, port: "port1" },
        })
        this.graph.addEdge(edge)
    }

    initData() {
        this.initGraph()
        insertCss(`
              @keyframes ant-line {
                to {
                    stroke-dashoffset: -1000
                }
              }
            `)
        this.graph.fromJSON(data)
        this.graph.history.redo()
        this.graph.history.undo()
        // 鼠标移入移出节点
        this.graph.on(
            "node:mouseenter",
            FunctionExt.debounce(() => {
                const container = document.getElementById("containerChart")
                const ports = container.querySelectorAll(".x6-port-body")
                this.showPorts(ports, true)
            }),
            500
        )
        this.graph.on("node:mouseleave", () => {
            const container = document.getElementById("containerChart")
            const ports = container.querySelectorAll(".x6-port-body")
            this.showPorts(ports, false)
        })
        this.graph.on("blank:click", () => {
            this.setState({ chooseType: "grid" })
        })
        this.graph.on("cell:click", ({ cell }) => {
            this.setState({
                chooseType: "",
            })
            console.log(cell)
            console.log("全局")
            console.log(this.graph)
            this.setState({
                chooseType: cell.isNode() ? "node" : "edge",
                cell: cell,
            })
        })
        this.graph.on("selection:changed", (args) => {
            args.added.forEach((cell) => {
                this.selectCell = cell
                if (cell.isEdge()) {
                    cell.isEdge() && cell.attr("line/strokeDasharray", 5) //虚线蚂蚁线
                    cell.addTools([
                        {
                            name: "vertices",
                            args: {
                                padding: 4,
                                attrs: {
                                    strokeWidth: 0.1,
                                    stroke: "#2d8cf0",
                                    fill: "#ffffff",
                                },
                            },
                        },
                    ])
                }
            })
            args.removed.forEach((cell) => {
                cell.isEdge() && cell.attr("line/strokeDasharray", 0) //正常线
                cell.removeTools()
            })
        })
        this.graph.on("edge:mouseup", (args) => {
            console.log(args)
            if (!args.view.targetView) {
                const id = `${Date.now()}`
                const expGraph = this.graph
                this.graph.addNode({
                    id,
                    width: 100,
                    height: 60,
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

        this.getData()
        console.log(this.graph)
    }

    graphChange(args) {
        const expGraph = this.graph
        let data = {
            node: [],
            connection: [],
            condition: [],
            action: [],
        }
        console.log(expGraph)
        console.log(expGraph.getNodes())
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
        console.log(expGraph.getEdges())
        expGraph.getEdges().map((item, index) => {
            let nodeData = item.getData()
            if (!nodeData) {
                nodeData = {}
            }
            let itemData = {
                begin: item.store.data.source.cell,
                key: item.id,
                end: item.store.data.target.cell,
                name: nodeData.name,
                condition: nodeData.condition,
            }
            data.connection.push(itemData)
        })
        data.action = expGraph.action
        data.condition = expGraph.condition
        console.log("数据")
        console.log(expGraph.condition)

        console.log(data)
        localStorage.setItem(
            "flow" + this.props.record.id,
            JSON.stringify(data)
        )
        console.log("flow" + this.props.record.id, JSON.stringify(data))
    }

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

    initGraph() {
        let { grid } = this.state
        this.graph = new Graph({
            container: document.getElementById("containerChart"),
            history: true,
            panning: true,
            transforming: {
                clearAll: true,
                clearOnBlankMouseDown: true,
            },
            width: 1700,
            height: "100%",
            grid: grid,
            resizing: {
                //调整节点宽高
                enabled: true,
                orthogonal: false,
            },
            selecting: true, //可选
            snapline: true,
            interacting: {
                edgeLabelMovable: true,
            },
            connecting: {
                // 节点连接
                anchor: "center",
                connectionPoint: "anchor",
                allowBlank: true,
                snap: true,
                createEdge: (args, other) => this.createEdgeFunc(),
            },
            highlighting: {
                magnetAvailable: {
                    name: "stroke",
                    args: {
                        padding: 4,
                        attrs: {
                            strokeWidth: 4,
                            stroke: "#6a6c8a",
                        },
                    },
                },
            },
        })
    }

    // 更改 连线方式
    createEdgeFunc(args) {
        console.log("新增线")
        console.log(args)
        let { connectEdgeType } = this.state
        return new Shape.Edge({
            attrs: {
                line: {
                    stroke: "#1890ff",
                    strokeWidth: 1,
                    targetMarker: {
                        name: "classic",
                        size: 8,
                    },
                    strokeDasharray: 0, //虚线
                    style: {
                        animation: "ant-line 30s infinite linear",
                    },
                },
            },
            labels: [
                {
                    attrs: {
                        text: {
                            text:
                                (args && args.data && args.data.name) ||
                                "未命名",
                            fontSize: 14,
                            fill: "#000000A6",
                        },
                        body: {
                            fill: "#00000000",
                        },
                    },
                },
            ],
            data: {
                name: "未命名",
            },
            connector: connectEdgeType.connector,
            router: {
                name: connectEdgeType.router.name || "",
            },
            zIndex: 0,
            ...args,
        })
    }

    // 是否显示 链接桩
    showPorts(ports, show) {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
            ports[i].style.visibility = show ? "visible" : "hidden"
        }
    }

    // 拖拽生成正方形或者圆形
    startDrag(type, e) {
        startDragToGraph(this.graph, type, e)
    }

    // 改变边形状
    changeEdgeType(index, type = "normal", routeName = "") {
        let { connectEdgeType } = this.state
        connectEdgeType = {
            connector: type,
            router: {
                name: routeName,
            },
        }
        this.setState({
            currentArrow: index,
            connectEdgeType: { ...connectEdgeType },
        })
    }

    // 删除节点
    deleteNode() {
        let { chooseType } = this.state
        const cell = this.graph.getSelectedCells()
        this.graph.removeCells(cell)
        chooseType = "grid"
        this.setState({ chooseType })
        this.graphChange()
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

    onChangeGridBack(type) {
        let { grid } = this.state
        if (typeof type === "string") {
            grid.type = type
            this.graph.drawGrid({
                ...grid,
            })
            return
        }
        if (typeof type === "number") {
            grid.args.thickness = type
            this.graph.drawGrid({
                ...grid,
            })
            return
        }
        type && this.graph.showGrid()
        !type && this.graph.hideGrid()
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

export default KingFlow
