import React, { useState, useEffect } from "react"
import { Form, Input, Radio, Tag, Select, InputNumber } from "antd"
import { useObservableState } from "@/common/hooks/useObservableState"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FormModal } from "./formModal"
// Cherrypick extra plugins
import clone from "clone"
import Sortable from "sortablejs/modular/sortable.complete.esm.js"
// import { ReactSortable } from "react-sortablejs";

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
    console.log(expGraph.getNodeById(nodeId).store.data.data)
    console.log(action)
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
    console.log(myAction)
    const [actions, setActions] = useState(myAction)
    const [allowActionRepeat, setAllowActionRepeat] = useState(
        initialValues.allow_action_repeat
    )

    const onValuesChange = async (activeExperiment, args, data) => {
        const { name } = activeExperiment
        console.log(args, data)
        console.log(activeExperiment)
        console.log("结果")
        console.log({ ...args, ...activeExperiment })
        if (activeExperiment.allow_action_repeat !== undefined)
            setAllowActionRepeat(activeExperiment.allow_action_repeat)
        if (activeExperiment.allow_action_repeat === true)
            await expGraph.renameNode(nodeId, {
                allow_repeat_time: initialValues.allow_repeat_time,
            })
        // if (node.name !== name) {
        await expGraph.renameNode(nodeId, {
            ...args,
            ...activeExperiment,
            allow_repeat_time: activeExperiment.allow_repeat_time,
        })
        // }
    }

    console.log("那是", actions)

    useEffect(() => {
        // Update the document title using the browser API
        var el = document.getElementById("items")
        console.log("is是", actions)
        console.log("el是", el)
        console.log(el?.style)

        var sortable =
            el &&
            new Sortable(el, {
                onChange: function (/**Event*/ evt) {
                    evt.newIndex // most likely why this event is used is to get the dragging element's current index
                    let sortableData = clone(
                        expGraph.getNodeById(nodeId).store.data.data.action
                    )
                    let temp = sortableData[evt.oldIndex]
                    sortableData[evt.oldIndex] = sortableData[evt.newIndex]
                    sortableData[evt.newIndex] = temp
                    expGraph.renameNode(nodeId, { action: null })
                    expGraph.renameNode(nodeId, {
                        action: [...sortableData],
                    })
                },
            })
        el = document.getElementById("items")
        console.log("el是", el)
        console.log(el?.style)
    }, [])
    return (
        <Form
            preserve={false}
            form={form}
            layout="vertical"
            initialValues={{
                ...initialValues,
                allow_repeat_time: initialValues.allow_repeat_time,
            }}
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
                        defaultValue={initialValues.allow_repeat_time}
                        placeholder="请输入允许重复次数"
                    />
                </Form.Item>
            )}
            {/* <Form.Item name={"opeation"} label="操作">
                <Input placeholder="请选择操作" />
            </Form.Item> */}
            <Form.Item label={"⾏为定义"}>
                <ul style={{ margin: "0", padding: "0" }} id="items">
                    {actions.map((item, index) => {
                        return (
                            <li
                                style={{ display: "inline-block" }}
                                key={item.key}
                            >
                                <Tag
                                    closable
                                    onClose={(data) => {
                                        let actionList = new Set(
                                            initialValues.action
                                        )
                                        expGraph.renameNode(nodeId, {
                                            action: null,
                                        })
                                        actionList.delete(item.key)
                                        expGraph.renameNode(nodeId, {
                                            action: [...actionList],
                                        })
                                        console.log(
                                            expGraph.getNodeById(nodeId)
                                        )
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
                            </li>
                        )
                    })}
                    <Tag
                        onClick={() => {
                            console.log(actions)
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
                </ul>
            </Form.Item>
            {/* <Form.Item label={"测试"}> */}
            {/* <ul >
                <li>item 1</li>
                <li>item 2</li>
                <li>item 3</li>
            </ul> */}
            {/* <ReactSortable list={state} setList={setState}>
                    {state.map((item) => (
                        <div key={item.id}>{item.name}</div>
                    ))}
                </ReactSortable> */}
            {/* </Form.Item> */}
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
