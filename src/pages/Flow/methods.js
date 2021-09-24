import { Addon, FunctionExt, Graph, Shape } from "@antv/x6"
import frSchema from "@/outter/fr-schema/src"

const { decorateList } = frSchema
// 拖拽生成四边形或者圆形
export const startDragToGraph = (graph, type, e, callback) => {
    const node =
        type === "Rect"
            ? graph.createNode({
                  width: 110,
                  height: 50,
                  data: {
                      name: "未命名",
                      allow_repeat_time: 2,
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
                      allow_repeat_time: 2,
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
                      allow_repeat_time: 2,
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
                      allow_repeat_time: 2,
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
                      ],
                  },
              })
    const dnd = new Addon.Dnd({ target: graph })
    dnd.start(node, e)
    callback()
}
export const ports = {
    groups: {
        // 输入链接桩群组定义
        top: {
            position: "top",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#2D8CF0",
                    strokeWidth: 1,
                    fill: "#fff",
                },
            },
        },
        // 输出链接桩群组定义
        bottom: {
            position: "bottom",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#2D8CF0",
                    strokeWidth: 1,
                    fill: "#fff",
                },
            },
        },
        left: {
            position: "left",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#2D8CF0",
                    strokeWidth: 1,
                    fill: "#fff",
                },
            },
        },
        right: {
            position: "right",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#2D8CF0",
                    strokeWidth: 1,
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
                        fontSize: 14,
                        fill: "#000000A6",
                    },
                    body: {
                        fill: "#00000000",
                    },
                },
                position: {
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
        position: {
            distance: -50,
        },
    })
}

// 初始化图
export function initGraph(expGraphData, callback) {
    let graph = new Graph({
        container: document.getElementById("containerChart"),
        history: true,
        panning: true,
        selecting: {
            enabled: true,
        },
        transforming: {
            clearAll: true,
            clearOnBlankMouseDown: true,
        },
        width: 1700,
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
        connecting: {
            // 节点连接
            anchor: "top",
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
        FunctionExt.debounce(() => {
            const container = document.getElementById("containerChart")
            const ports = container.querySelectorAll(".x6-port-body")
            showPorts(ports, true)
        }),
        500
    )
    graph.on("node:mouseleave", () => {
        const container = document.getElementById("containerChart")
        const ports = container.querySelectorAll(".x6-port-body")
        showPorts(ports, false)
    })

    return graph
}

function showPorts(ports, show) {
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
            (!item.allow_repeat_time || countName(nameArr, item.name) > 1) &&
            item.type !== "global"
        ) {
            let cell = graph.getCellById(item.key)
            cell.attr("body/stroke", "#ff4d4f")
            isTrue = false
        } else {
            let cell = graph.getCellById(item.key)
            cell.attr("body/stroke", undefined)
        }
    })
    nameArr = data.config.connection.map((item) => {
        return item.name
    })
    data.config.connection.map((item) => {
        if (countName(nameArr, item.name) > 1) {
            let cell = graph.getCellById(item.key)
            cell.attr("line/stroke", "#ff4d4f")
            isTrue = false
        } else {
            let cell = graph.getCellById(item.key)
            cell.attr("line/stroke", "#1890ff")
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
            let data = graph.getEdges().map((item) => {
                return item.getData().name
            })
            if (countName(data, value) > 1) {
                callback && callback(new Error("名称重复"))
                return false
            }
        }
    }
}

function sortUp(a, b) {
    return b.tier - a.tier
}

export function getTree(args) {
    let res =
        args &&
        args.map((item) => {
            return { ...item, value: item.key, title: item.name }
        })
    let record = []
    res &&
        res
            .filter((item) => {
                if (item.logical_path && item.logical_path.indexOf(".") < 0) {
                    record.push(item)
                    return true
                }
                return false
            })
            .map((item) => {
                let data = res.filter(
                    (one) =>
                        one.logical_path &&
                        one.logical_path.indexOf(item.logical_path) > -1
                )
                let list = decorateList(data, {})
                list = list.sort(sortUp)
                let result = []
                let arr = []
                for (let i = 0; i < list.length; i++) {
                    // 获取当前意图的所有上层意图
                    arr = list.filter((value) => {
                        return (
                            value.logical_path !== list[i].logical_path &&
                            list[i].logical_path.includes(value.logical_path)
                        )
                    })
                    // 存在上层意图则标明当前遍历意图为其他意图的子意图
                    if (arr.length) {
                        // 获取当前遍历意图的父意图 并加入其父意图的子集中
                        arr = arr.sort(sortUp)
                        let index = list.findIndex((value) => {
                            return value.id === arr[0].id
                        })
                        list[index].children.push(list[i])
                    } else {
                        // 不存在上层意图表示当前遍历意图为最高子意图
                        result.push(list[i])
                    }
                }
                console.log(result)
                // record.push(result)
                // record.children = [...result]
            })
    console.log(record)
    return record
}
