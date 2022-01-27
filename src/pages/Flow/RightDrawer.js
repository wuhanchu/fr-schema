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
import { CloseOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { ActionModal } from "./actionModal"
import { ConditionModal } from "./conditionModal"
import Sortable from "sortablejs/modular/sortable.complete.esm.js"
import node from "@/schemas/flow/node"
import { ItemName } from "@/components/item-name"

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
        return (
            chooseType === "grid" && (
                <div>
                    <div className="drawer_title">流程设置</div>
                    <div className="drawer_wrap">
                        <Form
                            labelAlign="left"
                            colon={false}
                            initialValues={{
                                ...record,
                                slot:
                                    record.slot && JSON.stringify(record.slot),
                                project_id:
                                    record.project_id &&
                                    record.project_id.length
                                        ? record.project_id
                                        : [],
                                intent_key:
                                    record.intent_key &&
                                    record.intent_key.length
                                        ? record.intent_key
                                        : [],
                            }}
                            onValuesChange={(args) => {
                                graph.flowSetting = args
                            }}
                            layout="vertical"
                        >
                            <FormItem name={"domain_key"} label="域">
                                <Select
                                    showSearch
                                    placeholder={"请选择域!"}
                                    disabled
                                    defaultActiveFirstOption={false}
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                    notFoundContent={null}
                                >
                                    {dict.domain &&
                                        dict.domain.map((item) => {
                                            return (
                                                <Select.Option
                                                    value={item.key}
                                                    key={item.key}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            )
                                        })}
                                </Select>
                            </FormItem>
                            <FormItem name={"name"} label="名称">
                                <Input disabled placeholder="请输入名称" />
                            </FormItem>
                            <FormItem name={"key"} label="编码">
                                <Input disabled placeholder="请输入编码" />
                            </FormItem>
                            <FormItem name={"intent_key"} label="意图">
                                <Select
                                    showSearch
                                    placeholder={"暂无意图!"}
                                    disabled
                                    mode="tags"
                                >
                                    {intentDict &&
                                        intentDict.map((item) => {
                                            return (
                                                <Select.Option
                                                    value={item.key}
                                                    key={item.key}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            )
                                        })}
                                </Select>
                            </FormItem>
                            <FormItem name={"project_id"} label="相关项目">
                                <Select
                                    showSearch
                                    placeholder={"暂无项目!"}
                                    disabled
                                    mode="tags"
                                >
                                    {projectDict &&
                                        projectDict.map((item) => {
                                            return (
                                                <Select.Option
                                                    value={item.id}
                                                    key={item.id}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            )
                                        })}
                                </Select>
                            </FormItem>
                            <FormItem name={"slot"} label="相关槽位">
                                <Input.TextArea
                                    disabled
                                    placeholder="暂无相关槽位"
                                />
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
                                            args.types === "master")
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
                                                oldType === "master") &&
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
                                            cell.attr("body/stroke", "#a0d911")
                                        })
                                    } else {
                                        graph.batchUpdate("changeType", () => {
                                            cell.attr("body/stroke", "#000000")
                                        })
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
                                                              key: "normal",
                                                              value: "normal",
                                                              label: "普通节点",
                                                          },
                                                      ]
                                            }
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
