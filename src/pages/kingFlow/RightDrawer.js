import React from "react"
import {
    Form,
    Input,
    Button,
    Radio,
    Slider,
    Switch,
    InputNumber,
    Popconfirm,
} from "antd"
import "./RightDrawer.less"
import { RiseOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons"
import { ActionModal } from "./actionModal"
import { ConditionModal } from "./conditionModal"

let FormItem = Form.Item

class RightDrawer extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            gridTypeList: [
                {
                    label: "四边网格",
                    value: "mesh",
                },
                {
                    label: "点状网格",
                    value: "dot",
                },
            ],
            showGrid: true,
            visible: false,
            showCondition: false,
            gridType: "mesh",
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
        const { graph, cell, intenList } = this.props

        return (
            <div className="drawer_container">
                {this.renderGrid()}
                {this.renderNode()}
                {this.renderEdge()}
                {visible && (
                    <ActionModal
                        actionType={formType}
                        handleChangeShowAction={() => {
                            this.handleChangeShowAction()
                        }}
                        type={"action"}
                        actions={showAction}
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

    renderGrid() {
        let { gridTypeList, showGrid, gridType } = this.state

        let { chooseType } = this.props
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        return (
            chooseType === "grid" && (
                <div>
                    <div className="drawer_title">流程设置</div>
                    <div className="drawer_wrap">
                        <Form
                            labelAlign="left"
                            colon={false}
                            {...formItemLayout}
                        >
                            <FormItem
                                name={"domain_key"}
                                label="域"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入允许重复次数！",
                                    },
                                ]}
                            >
                                <Input placeholder="请输入名称" />
                            </FormItem>
                            <FormItem
                                name={"name"}
                                label="名称"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入允许重复次数！",
                                    },
                                ]}
                            >
                                <Input placeholder="请输入名称" />
                            </FormItem>
                            {/* {showGrid && (
                                <div>
                                    <FormItem label="网格类型">
                                        <Radio.Group value={gridType}
                                                     onChange={e => this.onRadioChange(e)}>
                                            <div style={{display: 'flex'}}>
                                                {gridTypeList.map((item, index) =>
                                                    <Radio key={`radio${index}`} value={item.value}>
                                                        {item.label}
                                                    </Radio>
                                                )}
                                            </div>

                                        </Radio.Group>
                                    </FormItem>
                                    <FormItem label="网格大小">
                                        <Slider min={0} max={10} defaultValue={1} onChange={(value) => this.onGridSizeChange(value)}/>
                                    </FormItem>
                                </div>
                            )} */}
                        </Form>
                    </div>
                </div>
            )
        )
    }

    handleChangeShowAction() {
        let { chooseType, cell } = this.props
        console.log(this.props)
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
        console.log("condition---------------")
        console.log(this.props)
        if (cell) {
            const condition = this.props.graph && this.props.graph.condition
            console.log("===========")
            console.log(condition)
            let showCondition = []
            if (chooseType === "edge") {
                let initialValues = cell && cell.getData()
                console.log("initialValues是")

                console.log(initialValues)
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
            console.log("+++++++++++++")
            console.log(showCondition)
            this.setState({ showCondition })
        }
    }

    componentDidMount() {
        this.handleChangeShowAction()
        this.handleChangeShowCondition()
    }

    renderNode() {
        let { chooseType, cell, graph } = this.props
        let _this = this
        let { isShow, showAction, showCondition } = this.state
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 },
        }
        console.log("xuanran")
        console.log(showCondition)

        return (
            chooseType === "node" && (
                <div>
                    <div className="drawer_title">节点设置</div>
                    <div className="drawer_wrap">
                        <Form
                            labelAlign="left"
                            colon={false}
                            initialValues={cell.getData()}
                            {...formItemLayout}
                            onValuesChange={(args) => {
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
                                        message: "请输入允许重复次数！",
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
                                    placeholder="请输入允许重复次数"
                                />
                            </FormItem>
                            <FormItem label={"行为定义"}>
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
                                                    <Button
                                                    // closable
                                                    >
                                                        <span
                                                            onClick={() => {
                                                                // setVisible(true)

                                                                console.log(
                                                                    item
                                                                )
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
                                                            onConfirm={() => {
                                                                let myAction = []

                                                                let actionList = new Set(
                                                                    showAction.map(
                                                                        (
                                                                            item
                                                                        ) => {
                                                                            return item.key
                                                                        }
                                                                    )
                                                                )
                                                                cell.setData({
                                                                    action: null,
                                                                })

                                                                actionList.delete(
                                                                    item.key
                                                                )
                                                                cell.setData({
                                                                    action: [
                                                                        ...actionList,
                                                                    ],
                                                                })
                                                                console.log(
                                                                    "shanchu"
                                                                )
                                                                actionList &&
                                                                    actionList.map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => {
                                                                            let filterAction = graph.action.filter(
                                                                                (
                                                                                    list
                                                                                ) => {
                                                                                    return (
                                                                                        list.key ===
                                                                                        item
                                                                                    )
                                                                                }
                                                                            )
                                                                            if (
                                                                                filterAction &&
                                                                                filterAction[0]
                                                                            ) {
                                                                                myAction.push(
                                                                                    filterAction[0]
                                                                                )
                                                                            }
                                                                        }
                                                                    )

                                                                this.setState({
                                                                    showAction: myAction,
                                                                })
                                                            }}
                                                            // onCancel={cancel}
                                                            okText="是"
                                                            cancelText="否"
                                                        >
                                                            <CloseOutlined />
                                                        </Popconfirm>
                                                    </Button>
                                                </li>
                                            )
                                        })}
                                    <Button
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
                                    </Button>
                                </ul>
                            </FormItem>
                            {/* <FormItem label="功能">
                                <Button type="primary" icon={<RiseOutlined/>} className="button"
                                        style={{marginRight: '10px'}} onClick={_ => this.toTopZIndex()}>置顶</Button>
                                <Button type="danger" className="button" icon={<DeleteOutlined/>}
                                        onClick={_ => this.deleteNode()}>删除</Button>
                            </FormItem> */}
                        </Form>
                    </div>
                </div>
            )
        )
    }

    renderEdge() {
        let { chooseType, cell, graph } = this.props
        let { showCondition } = this.state
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 14 },
        }
        return (
            chooseType === "edge" && (
                <div>
                    <div className="drawer_title">连线设置</div>
                    <div className="drawer_wrap">
                        <Form
                            labelAlign="left"
                            colon={false}
                            initialValues={cell.getData()}
                            {...formItemLayout}
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
                                        message: "请输入允许重复次数！",
                                    },
                                ]}
                            >
                                <Input placeholder="请输入名称" />
                            </FormItem>
                            <FormItem
                                label="条件定义"
                                extra="条件之间为或的关系"
                            >
                                <ul
                                    style={{ margin: "0", padding: "0" }}
                                    id="items"
                                >
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
                                                <Button
                                                // closable
                                                >
                                                    <span
                                                        onClick={() => {
                                                            console.log(item)
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
                                                        onConfirm={() => {
                                                            let myConditions = []

                                                            let actionList = new Set(
                                                                showCondition.map(
                                                                    (item) => {
                                                                        return item.key
                                                                    }
                                                                )
                                                            )
                                                            cell.setData({
                                                                condition: null,
                                                            })
                                                            actionList.delete(
                                                                item.key
                                                            )
                                                            cell.setData({
                                                                condition: [
                                                                    ...actionList,
                                                                ],
                                                            })

                                                            actionList &&
                                                                actionList.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => {
                                                                        let filterAction = graph.condition.filter(
                                                                            (
                                                                                list
                                                                            ) => {
                                                                                return (
                                                                                    list.key ===
                                                                                    item
                                                                                )
                                                                            }
                                                                        )
                                                                        if (
                                                                            filterAction &&
                                                                            filterAction[0]
                                                                        ) {
                                                                            myConditions.push(
                                                                                filterAction[0]
                                                                            )
                                                                        }
                                                                    }
                                                                )

                                                            console.log(cell)
                                                            this.setState({
                                                                showCondition: myConditions,
                                                            })
                                                        }}
                                                        // onCancel={cancel}
                                                        okText="是"
                                                        cancelText="否"
                                                    >
                                                        <CloseOutlined />
                                                    </Popconfirm>
                                                </Button>
                                            </li>
                                        )
                                    })}
                                    <Button
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
                                    </Button>
                                </ul>
                            </FormItem>
                            {/* <FormItem label="功能">
                            <Button type="primary" icon={<RiseOutlined />} className="button"
                                style={{ marginRight: '10px' }} onClick={_ => this.toTopZIndex()}>置顶</Button>
                            <Button type="danger" class="margin-left-10" className="button" icon={<DeleteOutlined />}
                                onClick={_ => this.deleteNode()}>删除</Button>
                        </FormItem> */}
                        </Form>
                    </div>
                </div>
            )
        )
    }

    // 置顶
    toTopZIndex() {
        let { selectCell } = this.props
        selectCell.toFront()
    }

    // 删除
    deleteNode() {
        let { onDeleteNode } = this.props
        onDeleteNode && onDeleteNode()
    }

    onSwitchChange(checked) {
        let { changeGridBack } = this.props
        this.setState({ showGrid: checked })
        changeGridBack && changeGridBack(checked)
    }

    onRadioChange(e) {
        let { changeGridBack } = this.props
        this.setState({ gridType: e.target.value })
        changeGridBack && changeGridBack(e.target.value)
    }

    onGridSizeChange(value) {
        let { changeGridBack } = this.props
        changeGridBack && changeGridBack(value)
    }
}

export default RightDrawer
