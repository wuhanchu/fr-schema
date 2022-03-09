import { Addon, FunctionExt, Graph, Shape } from "@antv/x6"
import frSchema from "@/outter/fr-schema/src"
import clone from "clone"

const { decorateList } = frSchema
// 拖拽生成四边形或者圆形
export const startDragToGraph = async (graph, type, e, callback) => {
    let node
    if (type === "Master") {
        node = graph.createNode({
            width: 110,
            height: 50,

            data: {
                name: "未命名",
                allow_repeat_time: 5,
                skip_repeat_action: false,
                types: "master",
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
                    stroke: "#ad6800",
                    strokeWidth: 1,
                    fill: "#ffffff",
                },
            },
            ports: ports,
        })
    } else {
        if (type === "Flow") {
            node = graph.createNode({
                width: 110,
                height: 50,

                data: {
                    name: "未命名",
                    allow_repeat_time: 5,
                    skip_repeat_action: false,
                    types: "flow",
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
                        stroke: "#c41d7f",
                        strokeWidth: 1,
                        fill: "#ffffff",
                    },
                },
                ports: ports,
            })
        } else {
            node =
                type === "Rect"
                    ? graph.createNode({
                          width: 110,
                          height: 50,

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
                    : type === "Circle"
                    ? graph.createNode({
                          shape: "ellipse",
                          width: 110,
                          height: 50,
                          data: {
                              name: "全局节点",
                              allow_repeat_time: 5,
                              skip_repeat_action: false,
                              types: "global",
                          },
                          attrs: {
                              label: {
                                  text: "全局节点",
                                  fill: "#000000",
                                  fontSize: 14,
                                  textWrap: {
                                      width: -20,
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
                          ports: {
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
                    : type === "begin"
                    ? graph.createNode({
                          width: 110,
                          height: 50,
                          data: {
                              name: "开始节点",
                              allow_repeat_time: 5,
                              skip_repeat_action: false,
                              types: "begin",
                          },
                          attrs: {
                              radius: 20,
                              label: {
                                  text: "开始节点",
                                  fill: "#000000",
                                  fontSize: 14,
                                  textWrap: {
                                      width: -50,
                                      height: "70%",
                                      ellipsis: true,
                                  },
                              },
                              body: {
                                  rx: 20, // 圆角矩形
                                  fill: "#ffffff",
                                  stroke: "#000000",
                                  refPoints: "0,10 10,0 20,10 10,20",
                                  strokeWidth: 1,
                              },
                          },
                          ports: {
                              ...ports,
                              items: [
                                  {
                                      id: "port2",
                                      group: "bottom",
                                  },
                              ],
                          },
                      })
                    : graph.createNode({
                          width: 110,
                          height: 50,
                          data: {
                              name: "结束节点",
                              types: "end",
                              allow_repeat_time: 5,
                              skip_repeat_action: false,
                          },
                          attrs: {
                              radius: 20,
                              label: {
                                  text: "结束节点",
                                  fill: "#000000",
                                  fontSize: 14,
                                  textWrap: {
                                      width: -50,
                                      height: "70%",
                                      ellipsis: true,
                                  },
                              },
                              body: {
                                  rx: 20, // 圆角矩形
                                  fill: "#ffffff",
                                  stroke: "#000000",
                                  refPoints: "0,10 10,0 20,10 10,20",
                                  strokeWidth: 1,
                              },
                          },
                          ports: {
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
                          },
                      })
        }
    }

    const dnd = new Addon.Dnd({
        target: graph,
        validateNode: (node, optioon) => {
            let data = node.store.data
            if (
                data.position.y + graph.options.y < 60 &&
                data.position.x + graph.options.x < 250
            )
                return false
            callback()
            return true
        },
    })
    dnd.start(node, e)
}
export const ports = {
    groups: {
        // 输入链接桩群组定义
        top: {
            position: "top",
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: "#31d0c6",
                    strokeWidth: 2,
                    fill: "#fff",
                },
            },
        },
        // 输出链接桩群组定义
        bottom: {
            position: "bottom",
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: "#31d0c6",
                    strokeWidth: 2,
                    fill: "#fff",
                },
            },
        },
        left: {
            position: "left",
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: "#31d0c6",
                    strokeWidth: 2,
                    fill: "#fff",
                },
            },
        },
        right: {
            position: "right",
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: "#31d0c6",
                    strokeWidth: 2,
                    fill: "#fff",
                },
            },
        },
    },
    items: [
        {
            id: "port1",
            group: "top",
        },
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
}
// 连线
export function createEdgeFunc(args) {
    return new Shape.Edge({
        attrs: {
            line: {
                stroke: "#1890ff",
                strokeWidth: 1,
                targetMarker: false,
                // strokeDasharray: 0, //虚线
                style: {
                    animation: "ant-line 30s infinite linear",
                },
            },
        },

        labels: [
            {
                attrs: {
                    text: {
                        text: (args && args.data && args.data.name) || "未命名",
                        fontSize: 15,
                        zIndex: 1000,
                        fill: "#000000A6",
                    },
                    body: {
                        fill: "#00000000",
                    },
                },
                position: (args && args.data && args.data.lablesPosition) || {
                    distance: -70,
                },
            },
        ],
        data: {
            name: "未命名",
        },
        connector: "normal",
        router: {
            name: "manhattan",
        },
        zIndex: 0,

        tools: [
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
        position: {
            distance: -50,
        },
    })
}

// 初始化图
export function initGraph(expGraphData, callback, graphChange) {
    let graph = new Graph({
        container: document.getElementById("containerChart"),
        clipboard: true,
        history: {
            enabled: true,
            beforeAddCommand(event, args) {
                if (args.options) {
                    return args.options.ignoreHistory !== true
                }
            },
        },
        panning: true,
        selecting: {
            enabled: true,
        },
        transforming: {
            clearAll: true,
            clearOnBlankMouseDown: true,
        },
        width: 3700,
        height: "100%",
        grid: {
            size: 20, // 网格大小 10px
            visible: true, // 渲染网格背景
            type: "mesh",
            args: {
                color: "#D0D0D0",
                thickness: 1, // 网格线宽度/网格点大小
                factor: 10,
            },
        },
        resizing: {
            //调整节点宽高
            enabled: true,
            orthogonal: false,
        },
        snapline: true,
        // interacting: {
        //     edgeLabelMovable: true,
        // },
        interacting: function (cellView) {
            if (cellView.cell.getProp("customLinkInteractions")) {
                return { vertexAdd: false }
            }
            graphChange()
            return true
        },
        connecting: {
            // 节点连接
            anchor: "center",
            connectionPoint: "anchor",
            allowBlank: true,
            allowNode: false,

            snap: true,
            // 显示可用的链接桩
            validateConnection({
                sourceView,
                targetView,
                sourceMagnet,
                targetMagnet,
            }) {
                const container = document.getElementById("containerChart")
                const ports = container.querySelectorAll(".x6-port-body")
                showPorts(ports, true)
                return callback(
                    sourceView,
                    targetView,
                    sourceMagnet,
                    targetMagnet
                )
            },
            createEdge: (args, other) => createEdgeFunc(),
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

    graph.fromJSON({})
    graph.history.redo()
    graph.history.undo()
    graph.on(
        "node:mouseenter",
        (item, data) => {
            let dom = getDom("g", "data-cell-id", item.cell.id)
            const ports = dom[0].querySelectorAll(".x6-port-body")
            showPorts(ports, true)
        },
        500
    )
    graph.on("node:mouseleave", () => {
        const container = document.getElementById("containerChart")
        const ports = container.querySelectorAll(".x6-port-body")
        showPorts(ports, false)
    })

    return graph
}
function getDom(tagName, name, value) {
    var selectDom = []
    var dom = document.getElementsByTagName(tagName)
    for (var i = 0; i < dom.length; i++) {
        if (value === dom[i].getAttribute(name)) {
            selectDom.push(dom[i])
        }
    }
    return selectDom
}

export function showPorts(ports, show) {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? "visible" : "hidden"
    }
}

export function isError(data, graph) {
    let isTrue = true
    let nameArr = data.config.node.map((item) => {
        return item.name
    })
    data.config.node.map((item) => {
        if (
            (!item.allow_repeat_time ||
                countName(nameArr, item.name) > 1 ||
                item.skip_repeat_action === undefined) &&
            item.type !== "global"
        ) {
            let cell = graph.getCellById(item.key)
            cell.attr("body/stroke", "#ff4d4f")
            isTrue = false
        } else {
            if (item.type === "flow" && !item.flow_key) {
                let cell = graph.getCellById(item.key)
                cell.attr("body/stroke", "#ff4d4f")
                isTrue = false
            } else {
                let cell = graph.getCellById(item.key)
                // cell.attr("body/stroke", undefined)
            }
        }
    })
    nameArr = data.config.connection.map((item) => {
        return item.name
    })
    data.config.connection.map((item) => {
        if (!item.name || !item.begin) {
            let cell = graph.getCellById(item.key)
            cell.attr("line/stroke", "#ff4d4f")
            isTrue = false
        } else {
            let cell = graph.getCellById(item.key)
            // cell.attr("line/stroke", "#1890ff")
        }
    })
    return isTrue
}

export function countName(arr, num) {
    var countArr = arr.filter(function isBigEnough(value) {
        return value === num
    })
    return countArr.length
}

export function handleCFmName(rules, value, callback, type, graph) {
    if (!value) {
        callback && callback()
    } else {
        if (type === "node") {
            let data = graph.getNodes().map((item) => {
                return item.getData().name
            })
            if (countName(data, value) > 1) {
                callback && callback(new Error("名称重复"))
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }
}

function sortUp(a, b) {
    return b.tier - a.tier
}

// 广度优先
function treeForeach(tree, func) {
    let node,
        list = [...tree]
    while ((node = list.shift())) {
        func(node)
        node.key = node.itemKey
        node.children && list.push(...node.children)
    }
}

export function getTree(args, merge) {
    let res =
        args &&
        args.map((item) => {
            return { ...item, value: item.key, title: item.name }
        })
    let record = []
    let sortBy = res.filter((itemList) => {
        console.log(itemList)
        return itemList.logical_path && itemList.logical_path.indexOf(".") < 0
    })
    sortBy = sortBy.map((item) => {
        return { ...item, label: item.name + "(" + item.domain_key + ")" }
    })
    let list = sortBy.map((record) => {
        let list = res.filter((itemList) => {
            return (
                itemList.logical_path &&
                itemList.logical_path.indexOf(record.logical_path + ".") ===
                    0 &&
                itemList.logical_path !== record.logical_path &&
                itemList.domain_key === record.domain_key
            )
        })
        list = decorateList(list, {})
        list = list.sort(sortUp)
        let result = []
        let arr = []
        for (let i = 0; i < list.length; i++) {
            // 获取当前意图的所有上层意图
            arr = list.filter((value) => {
                return (
                    value.logical_path !== list[i].logical_path &&
                    list[i].logical_path.includes(value.logical_path + ".") &&
                    list[i].domain_key === value.domain_key
                )
            })
            // 存在上层意图则标明当前遍历意图为其他意图的子意图
            if (arr.length) {
                // 获取当前遍历意图的父意图 并加入其父意图的子集中
                arr = arr.sort(sortUp)
                let index = list.findIndex((value) => {
                    return value.id === arr[0].id
                })
                if (
                    !list[index].children.filter((item) => {
                        return item.id == list[i].id
                    }).length
                ) {
                    list[index].children.push(list[i])
                }
            } else {
                // 不存在上层意图表示当前遍历意图为最高子意图、
                result.push(list[i])
            }
            // record.children = [...result]
        }
        record.children = [...result]
        return record
        // }
    })
    treeForeach(list, (node) => {
        console.log(node.name)
    })
    return clone(list)
}
