import React from "react"
import {
    Form,
    Input,
    Button,
    InputNumber,
    Popconfirm,
    Tag,
    Select,
    Tooltip,
} from "antd"
import "./RightDrawer.less"
import { CloseOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { ActionModal } from "./actionModal"
import { ConditionModal } from "./conditionModal"
import Sortable from "sortablejs/modular/sortable.complete.esm.js"
import clone from "clone"

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
        const { graph, cell, intenList, expGraphData } = this.props
        let haveEnd = false
        expGraphData &&
            expGraphData.node &&
            expGraphData.node.map((item) => {
                if (item.type === "end") {
                    haveEnd = true
                }
            })
        return (
            <div className="drawer_container">
                {this.renderGrid()}
                {this.renderNode()}
                {this.renderEdge()}
                {visible && (
                    <ActionModal
                        actionType={formType}
                        graphChange={() => {
                            this.props.graphChange()
                        }}
                        handleChangeShowAction={() => {
                            this.handleChangeShowAction()
                        }}
                        type={"action"}
                        actions={showAction}
                        expGraphData={this.props.expGraphData}
                        cell={cell}
                        visible={visible}
                        graph={graph}
                        defaultValue={activationData || {}}
                        handleVisible={(args) => {
                            this.setState({ visible: args })
                        }}
                    />
                )}
                {conditionVisible && (
                    <ConditionModal
                        conditionType={formType}
                        graphChange={() => {
                            this.props.graphChange()
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
                    />
                )}

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
                        let data = this.props.graphChange()

                        if (this.isError(data)) {
                            await this.props.service.patch({
                                ...data,
                                id: this.props.record.id,
                            })
                            localStorage.removeItem(
                                "flow" + this.props.record.id
                            )
                            this.props.handleSetVisibleFlow(false)
                        }
                    }}
                    okText="是"
                    cancelText="否"
                >
                    <Button
                        style={{
                            position: "absolute",
                            right: "20px",
                            bottom: "20px",
                        }}
                    >
                        提交
                    </Button>
                </Popconfirm>
            </div>
        )
    }

    isError(data) {
        let isTrue = true
        let nameArr = data.config.node.map((item) => {
            return item.name
        })
        data.config.node.map((item) => {
            if (
                (!item.allow_repeat_time ||
                    this.countName(nameArr, item.name) > 1) &&
                item.type !== "global"
            ) {
                let cell = this.props.graph.getCellById(item.key)
                cell.attr("body/stroke", "#ff4d4f")
                isTrue = false
            } else {
                let cell = this.props.graph.getCellById(item.key)
                cell.attr("body/stroke", undefined)
            }
        })
        nameArr = data.config.connection.map((item) => {
            return item.name
        })
        data.config.connection.map((item) => {
            if (this.countName(nameArr, item.name) > 1) {
                let cell = this.props.graph.getCellById(item.key)
                cell.attr("line/stroke", "#ff4d4f")
                isTrue = false
            } else {
                let cell = this.props.graph.getCellById(item.key)
                cell.attr("line/stroke", "#1890ff")
            }
        })

        return isTrue
    }

    renderGrid() {
        let { chooseType, record, graph } = this.props
        return (
            chooseType === "grid" && (
                <div>
                    <div className="drawer_title">流程设置</div>
                    <div className="drawer_wrap">
                        <Form
                            labelAlign="left"
                            colon={false}
                            initialValues={{ ...record }}
                            onValuesChange={(args) => {
                                graph.flowSetting = args
                            }}
                            layout="vertical"
                        >
                            <FormItem
                                name={"domain_key"}
                                label="域"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入域！",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder={"请选择域!"}
                                    defaultActiveFirstOption={false}
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                    notFoundContent={null}
                                >
                                    {this.props.dict.domain &&
                                        this.props.dict.domain.map((item) => {
                                            return (
                                                <Select.Option value={item.key}>
                                                    {item.name}
                                                </Select.Option>
                                            )
                                        })}
                                </Select>
                            </FormItem>
                            <FormItem
                                name={"key"}
                                label="编码"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入编码！",
                                    },
                                ]}
                            >
                                <Input placeholder="请输入编码" />
                            </FormItem>
                        </Form>
                    </div>
                </div>
            )
        )
    }

    handleChangeShowAction() {
        let { chooseType, cell } = this.props
        if (cell) {
            const action = this.props.graph && this.props.graph.action
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
        let { chooseType, cell } = this.props
        if (cell) {
            const condition = this.props.graph && this.props.graph.condition
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
                    onChange: function (/**Event*/ evt) {
                        let sortableData = clone(cell.getData().action)

                        let temp = sortableData[evt.oldIndex]
                        sortableData[evt.oldIndex] = sortableData[evt.newIndex]
                        sortableData[evt.newIndex] = temp
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

    countName(arr, num) {
        var countArr = arr.filter(function isBigEnough(value) {
            return value === num
        })
        return countArr.length
    }

    handleCFmName(rules, value, callback, type) {
        if (!value) {
            callback && callback()
        } else {
            if (type === "node") {
                let data = this.props.graph.getNodes().map((item) => {
                    return item.getData().name
                })
                if (this.countName(data, value) > 1) {
                    callback && callback(new Error("名称重复"))
                    return false
                } else {
                    return true
                }
            } else {
                let data = this.props.graph.getEdges().map((item) => {
                    return item.getData().name
                })
                if (this.countName(data, value) > 1) {
                    callback && callback(new Error("名称重复"))
                    return false
                }
            }
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

    renderNode() {
        let { chooseType, cell } = this.props
        let { isShow, showAction } = this.state
        return (
            chooseType === "node" && (
                <div>
                    <div className="drawer_title">节点设置</div>
                    <div className="drawer_wrap">
                        <Form
                            ref={this.formNode}
                            labelAlign="left"
                            colon={false}
                            initialValues={cell.getData()}
                            preserve={false}
                            layout="vertical"
                            onValuesChange={(args, data) => {
                                cell.setData(args)
                                cell.setAttrs({
                                    label: { text: args.name },
                                })
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
                                            this.handleCFmName(
                                                rules,
                                                value,
                                                callback,
                                                "node"
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
                                label={
                                    <div>
                                        行为定义
                                        <Tooltip title="行为之间顺序执行，可以拖动进行排序">
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
                                        showAction.map((item, index) => {
                                            return (
                                                <li
                                                    style={{
                                                        display: "inline-block",
                                                        marginBottom: "5px",
                                                        marginRight: "10px",
                                                    }}
                                                    key={item.key}
                                                >
                                                    <Tag>
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
                                                            title="是否删除此行为?"
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
                    <div className="drawer_title">连线设置</div>
                    <div className="drawer_wrap">
                        <Form
                            ref={this.formEdge}
                            labelAlign="left"
                            colon={false}
                            initialValues={cell.getData()}
                            layout="vertical"
                            onValuesChange={(args) => {
                                cell.setData(args)
                                cell.setLabels({
                                    attrs: {
                                        text: {
                                            text: args.name,
                                            fontSize: 14,
                                            fill: "#000000A6",
                                        },
                                        body: {
                                            fill: "#00000000",
                                        },
                                    },
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
                                            this.handleCFmName(
                                                rules,
                                                value,
                                                callback,
                                                "edge"
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
                                        <Tooltip title="条件之间为或的关系,一个条件成立即条件成立">
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
                                                <Tag>
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
