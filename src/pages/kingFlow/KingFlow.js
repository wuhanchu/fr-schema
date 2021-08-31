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
import Ellipse from "./ellipse.svg"
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
                    name: "manhattan",
                },
            },
            currentArrow: 3,
            cell: undefined,
            selectCell: "",
            expGraphData: {},
        }
        this.deleteNode = this.deleteNode.bind(this)
        this.onChangeGridBack = this.onChangeGridBack.bind(this)
    }

    getIntent = async () => {
        let data = await schema.service.get({
            limit: 1000,
            key: "not.eq.null",
            domain_key: this.props.record.domain_key,
        })
        this.setState({ intenList: data.list })
    }

    componentDidMount() {
        this.initData()
        this.getIntent()
        // this.changeEdgeType(3, null, "manhattan")
        this.graph.flowSetting = {
            key: this.props.record.key,
            domain_key: this.props.record.domain_key,
        }
    }

    render() {
        let { currentArrow, chooseType, cell, intenList } = this.state
        return (
            <div className="container_warp">
                <div id="containerChart" />
                {chooseType && (
                    <RightDrawer
                        service={this.props.service}
                        record={this.props.record}
                        intenList={intenList}
                        dict={this.props.dict}
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
                            title="开始节点"
                            onMouseDown={(e) => this.startDrag("begin", e)}
                        >
                            <img style={{ marginTop: "-7px" }} src={Ellipse} />
                        </div> */}
                        <div
                            className="btn"
                            title="结束节点"
                            onMouseDown={(e) => this.startDrag("end", e)}
                        >
                            {/* <i className="iconfont icon-square rotate-square" /> */}
                            <img style={{ marginTop: "-7px" }} src={Ellipse} />
                        </div>
                    </div>
                    <div className="btn-group">
                        {/*<Tooltip title="直线箭头" placement="bottom">*/}
                        {/*    <div*/}
                        {/*        className={*/}
                        {/*            currentArrow === 1*/}
                        {/*                ? "currentArrow btn"*/}
                        {/*                : "btn"*/}
                        {/*        }*/}
                        {/*        onClick={(e) =>*/}
                        {/*            this.changeEdgeType(1, "normal")*/}
                        {/*        }*/}
                        {/*    >*/}
                        {/*        <i className="iconfont icon-ai28" />*/}
                        {/*    </div>*/}
                        {/*</Tooltip>*/}
                        {/*<Tooltip title="曲线箭头" placement="bottom">*/}
                        {/*    <div*/}
                        {/*        className={*/}
                        {/*            currentArrow === 2*/}
                        {/*                ? "currentArrow btn"*/}
                        {/*                : "btn"*/}
                        {/*        }*/}
                        {/*        onClick={(e) =>*/}
                        {/*            this.changeEdgeType(2, "smooth")*/}
                        {/*        }*/}
                        {/*    >*/}
                        {/*        <i className="iconfont icon-Down-Right" />*/}
                        {/*    </div>*/}
                        {/*</Tooltip>*/}
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
                                // onClick={(_) => this.formatGraph()}
                            />
                        </Tooltip>
                    </div>
                </div>
            </div>
        )
    }

    async getData() {
        let data = localStorage.getItem("flow" + this.props.record.id)
        data = JSON.parse(data)
        if (!data) {
            let res = await this.props.service.getDetail({
                id: this.props.record.id,
            })
            if (res.config && res.config.node && res.config.node.length) {
                data = res.config
            } else {
                data = {
                    node: [
                        {
                            name: "开始节点",
                            key: `${Date.now()}`,
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
                        key: `${Date.now()}`,
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
        this.setState({
            expGraphData: data,
        })

        this.graph.action = data.action
        this.graph.condition = data.condition
    }

    addNodes(args) {
        this.graph.addNode({
            id: args.key,
            width: 110,
            height: 50,
            shape: args.shape,
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
                    : args.type !== "begin" && args.type !== "globle"
                    ? ports
                    : {
                          ...ports,
                          items: [
                              {
                                  id: "port2",
                                  group: "bottom",
                              },
                          ],
                      },
        })
        return args.key
    }

    addEdges(args) {
        if (args.begin) {
            let edge = this.createEdgeFunc({
                id: args.key,
                data: { ...args },
                source: { cell: args.begin, port: "port2" },
                target: { cell: args.end, port: "port1" },
            })
            this.graph.addEdge(edge)
        } else {
            let endNode = this.graph.getCellById(args.end)
            let key = `${Date.now()}`
            this.addNodes({
                key,
                name: "全局节点",
                action: [],
                shape: "ellipse",
                type: "globle",
                allow_repeat_time: 2,
                position: {
                    x: endNode.store.data.position.x,
                    y: endNode.store.data.position.y - 150,
                },
            })
            let edge = this.createEdgeFunc({
                id: args.key,
                data: { ...args },
                source: { cell: key, port: "port2" },
                target: { cell: args.end, port: "port1" },
            })

            this.graph.addEdge(edge)
        }
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
            if (cell.getData().types === "globle") {
                this.setState({
                    chooseType: "grid",
                })
            } else {
                this.setState({
                    chooseType: cell.isNode() ? "node" : "edge",
                    cell: cell,
                })
            }
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
            if (!args.view.targetView) {
                const id = `${Date.now()}`
                const expGraph = this.graph
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

        this.getData()
    }

    graphChange(args) {
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
            if (nodeData.types !== "globle") data.node.push(itemData)
        })
        expGraph.getEdges().map((item, index) => {
            let nodeData = item.getData()
            // if(this.graph.getCellById(item.store.data.source.cell).getData().type)
            let begin = item.store.data.source.cell
            if (this.graph.getCellById(begin).getData().types === "globle") {
                begin = null
            }
            if (!nodeData) {
                nodeData = {}
            }
            let itemData = {
                begin: begin,
                key: item.id,
                end: item.store.data.target.cell,
                name: nodeData.name,
                condition: nodeData.condition,
            }
            data.connection.push(itemData)
        })
        data.action = expGraph.action
        data.condition = expGraph.condition

        this.setState({
            expGraphData: data,
        })
        localStorage.setItem(
            "flow" + this.props.record.id,
            JSON.stringify(data)
        )
        return { config: data, ...expGraph.flowSetting }
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
        let _this = this
        this.graph = new Graph({
            container: document.getElementById("containerChart"),
            history: true,
            panning: true,
            selecting: {
                enabled: true,
                rubberband: true, // 启用框选
            },
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
            // interacting: {
            //     edgeLabelMovable: true,
            // },
            connecting: {
                // 节点连接
                anchor: "top",
                connectionPoint: "anchor",
                allowBlank: true,
                snap: true,
                // 显示可用的链接桩
                validateConnection({
                    sourceView,
                    targetView,
                    sourceMagnet,
                    targetMagnet,
                }) {
                    // return true

                    if (
                        targetMagnet &&
                        targetMagnet.getAttribute("port-group") !== "top"
                    ) {
                        return false
                    }
                    if (sourceView === targetView) {
                        return false
                    }

                    const expGraph = this.graph
                    let isTrue = true

                    if (targetView && sourceView) {
                        _this.state.expGraphData.connection.map((item) => {
                            if (
                                item.end === targetView.cell.id &&
                                item.begin === sourceView.cell.id
                            ) {
                                isTrue = false
                            }
                        })
                    }

                    return isTrue
                },
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
        let { connectEdgeType } = this.state
        return new Shape.Edge({
            attrs: {
                line: {
                    stroke: "#1890ff",
                    strokeWidth: 1,
                    targetMarker: false,
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
                    // position: {
                    //     distance: -150
                    // }
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
            tools: [
                // { name: 'source-arrowhead' },
                {
                    name: "target-arrowhead",
                    args: {
                        tagName: "path",
                        attrs: {
                            // r: 6,
                            d: "M -5 -4 5 0 -5 4 Z",
                            fill: "#1890ff",
                            stroke: "#1890ff",
                            // "stroke-width": 1,
                            cursor: "move",
                        },
                    },
                },
            ],
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
        const cell = this.graph.getSelectedCells()
        if (cell && cell[0] && cell[0].getData().types != "begin") {
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

    // 格式化
    formatGraph() {
        let data = this.graph.toJSON().cells
        let nodeList = [] // 视图中节点数据集
        let edgeList = [] // 视图中线数据集
        edgeList = data.filter((value) => {
            return value.shape === "edge"
        })
        nodeList = data.filter((value) => {
            return value.shape !== "edge"
        })
        // 找到开始节点
        let firstNode = nodeList.find((value) => {
            return value.data.types === "begin"
        })
        // 获取格式化数据
        let list = this.deepNode([firstNode], nodeList, edgeList)
        let dataList = list.dataList.sort(this.sortDown)
        // dataList = dataList.filter((value) => value.tier.length !== 0)
        // console.info('1213', dataList)
        let arr = this.deepData(dataList[0].childrenNode, dataList)
        let ids = []
        let resNode = []
        for (let i = 0; i < arr.length; i++) {
            if (!ids.includes(arr[i].id)) {
                resNode.push(arr[i])
                ids.push(arr[i].id)
            }
        }
        console.info("121323", arr, resNode, dataList)
        let res = { cells: [...edgeList, firstNode, ...resNode] }

        this.graph.fromJSON(res)
    }

    // 递归格式化数据
    deepNode(nodes, nodeList, edgeList, tier = 0) {
        let list = []
        let dataList = []
        let flag = false
        let tierFlag = true
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i]
            tierFlag && (tier += 1)
            node.tier = tier
            tierFlag = false
            let edges = edgeList.filter((value) => {
                return value.source.cell === node.id
            })
            // 该节点无连线数据-> 当前节点为结束节点(某条分支的最后一个节点)
            // if (!edges.length) {
            //     continue;
            // }
            let nodeIds = [] // 当前节点的子节点id集合
            edges.map((item) => nodeIds.push(item.target.cell))
            let childrenNode = [] // 当前节点的子节点集合
            childrenNode = nodeList.filter((value) => {
                return nodeIds.includes(value.id)
            })
            // if (childrenNode.length > 2) {
            //     node.position.x = node.direction === 'left' ? node.position.x - (260 * (childrenNode.length - 2)) : node.position.x + (260 * (childrenNode.length - 2))
            // }
            // if (flag) {
            //     node.position.x = nodes[i - 2].position.x - (220 * (nodes[i - 2].childrenNode.length))
            //     flag = false
            // }
            // // 子节点只有一个,节点显示在父节点正下方
            // if (childrenNode.length === 1) {
            //     childrenNode[0].position = {x: node.position.x, y: node.position.y + 150};
            // }
            // 多个子节点则左右放置
            if (childrenNode.length > 0) {
                flag = true
                for (let j = 0; j < childrenNode.length; j++) {
                    childrenNode[j].parentId = node.id
                }
            }
            node.childrenNode = [...childrenNode]
            // 递归子节点数据
            list.push(...childrenNode)
            let arr = this.deepNode(childrenNode, nodeList, edgeList, tier)
            list.push(...arr.list)
            dataList.push(node, ...arr.dataList)
        }
        return { list: list, dataList: dataList }
    }

    deepData(list, dataList) {
        let res = []
        console.info("111", list)
        for (let i = 0; i < list.length; i++) {
            if (list[i].childrenNode && list[i].parentId) {
                let length = list[i].childrenNode.length
                let index = dataList.findIndex((value) => {
                    return value.id === list[i].parentId
                })
                let realIndex = dataList[index].childrenNode.findIndex(
                    (value) => {
                        return value.id === list[i].id
                    }
                )
                console.info("parent", list[i], dataList[index])
                let positionX = dataList[index].position.x
                let positionY = dataList[index].position.y
                let num = i + (length || 1)
                console.info("1112312", realIndex, realIndex % 2 === 0)
                if (realIndex % 2 === 0) {
                    console.info(
                        "left",
                        list[i],
                        positionX,
                        num,
                        positionX - 250 * num
                    )
                    list[i].position = {
                        x: positionX - 165 * num,
                        y: positionY + 150,
                    }
                } else {
                    list[i].position = {
                        x: positionX + 165 * (num - 1),
                        y: positionY + 150,
                    }
                    console.info(
                        "right",
                        list[i],
                        positionX,
                        num,
                        positionX + 250 * num
                    )
                }
                res.push(...this.deepData(list[i].childrenNode, dataList))
            }
            res.push(list[i])
        }
        return res
    }

    // 排序规则(从小到大)
    sortDown(a, b) {
        return a.tier - b.tier
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
