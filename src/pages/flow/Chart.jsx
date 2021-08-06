import React from "react"
import { Graph, Edge, Shape, NodeView } from "@antv/x6"
import { Card, Input, Row, Col } from "antd"
import { ReactShape } from "@antv/x6-react-shape"
import schema from "@/schemas/flow/index"
import InfoForm from "@/outter/fr-schema-antd-utils/src/components/Page/InfoForm"

class MyComponent extends React.Component {
    shouldComponentUpdate() {
        const node = this.props.node
        if (node) {
            if (node.hasChanged("data")) {
                return true
            }
        }

        return false
    }

    render() {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    lineHeight: "50px",
                    border: "2px solid #9254de",
                    borderRadius: 4,
                    background: "#efdbff",
                }}
            >
                {this.props.text}
            </div>
        )
    }
}

class Label extends React.Component {
    onClick = () => {
        alert("clicked")
    }

    render() {
        return (
            <button
                style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    color: "#000",
                    background: "#ffd591",
                    border: "2px solid #ffa940",
                    borderRadius: 4,
                }}
                onClick={this.onClick}
            >
                React Button
            </button>
        )
    }
}

// 定义节点
class MyShape extends Shape.Rect {
    getInPorts() {
        return this.getPortsByGroup("in")
    }

    getOutPorts() {
        return this.getPortsByGroup("out")
    }

    getUsedInPorts(graph) {
        const incomingEdges = graph.getIncomingEdges(this) || []
        return incomingEdges.map((edge) => {
            const portId = edge.getTargetPortId()
            return this.getPort(portId)
        })
    }

    getNewInPorts(length) {
        return Array.from(
            {
                length,
            },
            () => {
                return {
                    group: "in",
                }
            }
        )
    }

    updateInPorts(graph) {
        const minNumberOfPorts = 2
        const ports = this.getInPorts()
        const usedPorts = this.getUsedInPorts(graph)
        const newPorts = this.getNewInPorts(
            Math.max(minNumberOfPorts - usedPorts.length, 1)
        )

        if (
            ports.length === minNumberOfPorts &&
            ports.length - usedPorts.length > 0
        ) {
            // noop
        } else if (ports.length === usedPorts.length) {
            this.addPorts(newPorts)
        } else if (ports.length + 1 > usedPorts.length) {
            this.prop(
                ["ports", "items"],
                this.getOutPorts().concat(usedPorts).concat(newPorts),
                {
                    rewrite: true,
                }
            )
        }

        return this
    }
}

MyShape.config({
    attrs: {
        root: {
            magnet: false,
        },
        label: {
            fontSize: 14,
            fill: "#333",
            fontFamily: "Arial, helvetica, sans-serif",
            textAnchor: "middle",
            textVerticalAnchor: "middle",
        },
        body: {
            fill: "#f5f5f5",
            stroke: "#d9d9d9",
            strokeWidth: 1,
        },
        image: {
            event: "node:delete",
            xlinkHref: "trash.png",
            width: 20,
            height: 20,
        },
    },
    ports: {
        items: [
            {
                group: "out",
            },
        ],
        groups: {
            in: {
                position: {
                    name: "top",
                },
                attrs: {
                    portBody: {
                        magnet: "passive",
                        r: 6,
                        stroke: "#ffa940",
                        fill: "#fff",
                        strokeWidth: 2,
                    },
                },
            },
            out: {
                position: {
                    name: "bottom",
                },
                attrs: {
                    portBody: {
                        magnet: true,
                        r: 6,
                        fill: "#fff",
                        stroke: "#3199FF",
                        strokeWidth: 2,
                    },
                },
            },
        },
    },
    portMarkup: [
        {
            tagName: "circle",
            selector: "portBody",
        },
    ],
    propHooks(metadata) {
        const { label, ...others } = metadata
        if (label) {
            ObjectExt.setByPath(others, "attrs/text/text", label)
        }
        return others
    },
})

// 高亮
const magnetAvailabilityHighlighter = {
    name: "stroke",
    args: {
        attrs: {
            fill: "#fff",
            stroke: "#47C769",
        },
    },
}

// 画布

class Chart extends React.Component {
    formRef = React.createRef()
    componentDidMount() {
        let _this = this
        this.setState({ value: "" })
        const graph = new Graph({
            grid: true,
            width: 800,
            height: 600,
            container: document.getElementById("container"),
            highlighting: {
                magnetAvailable: magnetAvailabilityHighlighter,
                magnetAdsorbed: {
                    name: "stroke",
                    args: {
                        attrs: {
                            fill: "#fff",
                            stroke: "#31d0c6",
                        },
                    },
                },
            },
            connecting: {
                snap: true,
                allowBlank: false,
                allowLoop: false,
                highlight: true,
                connector: "rounded",
                connectionPoint: "boundary",
                router: {
                    name: "er",
                    args: {
                        direction: "V",
                    },
                },
                createEdge() {
                    return new Shape.Edge({
                        attrs: {
                            line: {
                                stroke: "#a0a0a0",
                                strokeWidth: 1,
                                targetMarker: {
                                    name: "classic",
                                    size: 7,
                                },
                            },
                        },
                    })
                },
                validateConnection({ sourceView, targetView, targetMagnet }) {
                    if (!targetMagnet) {
                        return false
                    }

                    if (targetMagnet.getAttribute("port-group") !== "in") {
                        return false
                    }

                    if (targetView) {
                        const node = targetView.cell
                        if (node instanceof MyShape) {
                            const portId = targetMagnet.getAttribute("port")
                            const usedInPorts = node.getUsedInPorts(graph)
                            if (
                                usedInPorts.find(
                                    (port) => port && port.id === portId
                                )
                            ) {
                                return false
                            }
                        }
                    }

                    return true
                },
            },
            onEdgeLabelRendered: (args) => {
                const { selectors } = args
                const content = selectors.foContent
                if (content) {
                    ReactDOM.render(<Label />, content)
                }
            },
        })

        const rect1 = new MyShape()
            .resize(120, 50)
            .position(200, 50)
            .updateInPorts(graph)
        const rect2 = new MyShape()
            .resize(120, 50)
            .position(400, 50)
            .updateInPorts(graph)
        const rect3 = new MyShape()
            .resize(120, 50)
            .position(300, 250)
            .updateInPorts(graph)
        console.log(rect1)
        const edges = new Shape.Edge({
            source: rect2,
            target: rect3,
            attrs: {
                line: {
                    stroke: "#a0a0a0",
                    strokeWidth: 1,
                    targetMarker: {
                        name: "classic",
                        size: 7,
                    },
                },
            },
        })
        graph.addNode(rect1)
        graph.addNode(rect2)
        graph.addNode(rect3)

        graph.addEdge(edges)

        function update(view) {
            console.log(view)
            const cell = view.cell
            if (cell instanceof MyShape) {
                cell.getInPorts().forEach((port) => {
                    const portNode = view.findPortElem(port.id, "portBody")
                    view.unhighlight(portNode, {
                        highlighter: magnetAvailabilityHighlighter,
                    })
                })

                console.log(graph)
                cell.updateInPorts(graph)
            }
        }

        graph.on("edge:connected", ({ previousView, currentView }) => {
            console.log(previousView, currentView)
            if (previousView) {
                update(previousView)
            }
            if (currentView) {
                update(currentView)
            }
        })

        graph.on("edge:click", ({ e, x, y, edge, view }) => {
            this.setState({
                type: "",
            })
            console.log(edge)

            this.setState({
                edge,
                type: "intention",
                value: "",
            })
        })

        graph.on("edge:removed", ({ edge, options }) => {
            if (!options.ui) {
                return
            }
            console.log(edge)
            const target = edge.getTargetCell()
            if (target instanceof MyShape) {
                target.updateInPorts(graph)
            }
        })

        graph.on("edge:mouseenter", ({ edge }) => {
            edge.addTools([
                "source-arrowhead",
                "target-arrowhead",
                {
                    name: "button-remove",
                    args: {
                        distance: -30,
                    },
                },
            ])
        })

        graph.on("edge:mouseleave", ({ edge }) => {
            edge.removeTools()
        })

        graph.on("node:click", ({ e, x, y, node, view }) => {
            console.log(e, x, y, node, view)
            console.log(view.cell)
            this.setState({
                type: "",
            })
            this.setState({
                node,
                type: "node",
                value: "",
            })
            e.stopPropagation()
            view.cell.remove()
        })

        graph.on("node:delete", ({ view, e }) => {
            e.stopPropagation()
            view.cell.remove()
        })

        graph.on("node:customevent", ({ name, view, e }) => {
            if (name === "node:delete") {
                e.stopPropagation()
                view.cell.remove()
            }
        })
    }

    render() {
        console.log(schema["node"])
        return (
            <Card style={{ height: "100%" }}>
                <Row gutter={24}>
                    <Col lg={18}>
                        <div id="container" />
                    </Col>
                    <Col lg={6}>
                        {this.state && this.state.type && (
                            <InfoForm
                                form={this.formRef}
                                action={"edit"}
                                schema={
                                    schema[
                                        this.state && this.state.type
                                            ? this.state.type
                                            : "node"
                                    ].schema
                                }
                                labelCol={24}
                                wrapperCol={24}
                                values={{}}
                                onValuesChange={(changedValues, allValues) => {
                                    console.log(changedValues, allValues)
                                    if (this.state.type === "node") {
                                        this.state.node.attr({
                                            text: {
                                                text:
                                                    allValues && allValues.name,
                                            },
                                        })
                                    } else {
                                        if (this.state.type === "intention") {
                                            this.state.edge.setLabels({
                                                attrs: {
                                                    text: {
                                                        text:
                                                            allValues &&
                                                            allValues.name,
                                                    },
                                                },
                                            })
                                        }
                                    }
                                }}
                            />
                        )}
                    </Col>
                </Row>
            </Card>
        )
    }
}

export default Chart
