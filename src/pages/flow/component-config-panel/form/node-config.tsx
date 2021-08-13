import React, { useState } from "react"
import { Form, Input, Radio, Tag, Select, InputNumber } from "antd"
import { useObservableState } from "@/common/hooks/useObservableState"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FormModal } from "./formModal"

export interface Props {
    name: string
    experimentId: string
    nodeId: string
}

export const NodeFormDemo: React.FC<Props> = ({
    name,
    nodeId,
    experimentId,
}) => {
    const [form] = Form.useForm()

    const expGraph = useExperimentGraph(experimentId)
    const [node] = useObservableState(() => expGraph.activeNodeInstance$)
    const [visible, setVisible] = useState(false)

    const [type, setType] = useState("action")
    const [actionType, setActionType] = useState("add")
    console.log(expGraph.getEdges(), expGraph.getNodes(), expGraph)
    let { action, condition } = expGraph.formData

    const [tagIndex, setTagIndex] = useState(0)

    const [defaultValue, setDefaultValue] = useState({})
    let initialValues =
        expGraph.getNodeById(nodeId) &&
        expGraph.getNodeById(nodeId).store.data.data

    let myAction = []
    if (nodeId && expGraph.getNodeById(nodeId)) {
        initialValues = expGraph.getNodeById(nodeId).store.data.data
        initialValues.action &&
            initialValues.action.map((item, index) => {
                let filterAction = action.filter((list) => {
                    return list.key === item
                })
                if (filterAction && filterAction[0]) {
                    myAction.push(filterAction[0])
                }
            })
    }
    const [actions, setActions] = useState(myAction)
    const [allowActionRepeat, setAllowActionRepeat] = useState(
        initialValues.allow_action_repeat
    )

    const onValuesChange = async (activeExperiment) => {
        const { name } = activeExperiment
        setAllowActionRepeat(activeExperiment.allow_action_repeat)
        if (node.name !== name) {
            await expGraph.renameNode(nodeId, activeExperiment)
        }
    }
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onValuesChange={onValuesChange}
            requiredMark={false}
        >
            <Form.Item label="节点名称" name="name">
                <Input placeholder="请输入节点名称" />
            </Form.Item>
            {/* <Form.Item name={"type"} label={"节点类型"}>
                <Input placeholder="请输入节点类型" />
            </Form.Item> */}
            <Form.Item name={"allow_action_repeat"} label={"是否允许重复"}>
                <Select
                    placeholder="请输入是否允许重复"
                    style={{ width: "100%" }}
                >
                    <Select.Option value={true}>是</Select.Option>
                    <Select.Option value={false}>否</Select.Option>
                </Select>
            </Form.Item>
            {allowActionRepeat && (
                <Form.Item name={"allow_repeat_time"} label={"允许重复次数"}>
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="请输入允许重复次数"
                    />
                </Form.Item>
            )}
            {/* <Form.Item name={"opeation"} label="操作">
                <Input placeholder="请选择操作" />
            </Form.Item> */}
            <Form.Item label={"⾏为定义"}>
                {actions.map((item, index) => {
                    return (
                        <Tag
                            closable
                            onClose={(data) => {
                                let actionList = new Set(initialValues.action)
                                expGraph.renameNode(nodeId, { action: null })
                                actionList.delete(item.key)
                                expGraph.renameNode(nodeId, {
                                    action: [...actionList],
                                })
                            }}
                            onClick={() => {
                                setActionType("edit")
                                setType("action")
                                setTagIndex(index)
                                setDefaultValue(item)
                                setVisible(true)
                            }}
                        >
                            {item.name}
                        </Tag>
                    )
                })}
                <Tag
                    onClick={() => {
                        setActionType("add")
                        setTagIndex(actions.length)
                        setVisible(true)
                        setDefaultValue({})
                        setType("action")
                    }}
                    color="#2db7f5"
                >
                    +
                </Tag>
            </Form.Item>
            {/* <Form.Item label="操作">
                <Input placeholder="请选择操作" />
            </Form.Item> */}
            {/* 提交定义：<FolderAddTwoTone /> */}
            {visible && (
                <FormModal
                    actionType={actionType}
                    type={type}
                    keyIndex={nodeId + "-" + tagIndex}
                    experimentId={experimentId}
                    visible={visible}
                    actions={actions}
                    actionList={initialValues.action}
                    nodeId={nodeId}
                    handleVisible={setVisible}
                    defaultValue={defaultValue}
                    setActions={setActions}
                />
            )}
        </Form>
    )
}
