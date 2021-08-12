import React, { useState } from "react"
import { Form, Input, Radio, Tag } from "antd"
import { useObservableState } from "@/common/hooks/useObservableState"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FormModal } from "./condtionModal"
export interface Props {
    name: string
    experimentId: string
    nodeId: string
    edge: object
}

export const ExperimentForm: React.FC<Props> = ({
    experimentId,
    name,
    edges,
    nodeId,
}) => {
    const [form] = Form.useForm()

    const [visible, setVisible] = useState(false)
    const [type, setType] = useState("action")
    const [actionType, setActionType] = useState("add")

    const expGraph = useExperimentGraph(experimentId)
    let { action, condition } = expGraph.formData

    const [actions, setActions] = useState(action)
    const [tagIndex, setTagIndex] = useState(0)

    const [defaultValue, setDefaultValue] = useState({})

    const [activeExperiment] = useObservableState(expGraph.experiment$)

    console.log(expGraph)
    let initialValues = {}
    let myCondtion = []
    if (nodeId && expGraph.getEdgeById(nodeId)) {
        initialValues = expGraph.getEdgeById(nodeId).store.data.data
        console.log(initialValues)
        initialValues.condition &&
            initialValues.condition.map((item, index) => {
                console.log(item)
                let filterCondtion = condition.filter((list) => {
                    return list.key === item
                })
                if (filterCondtion && filterCondtion[0]) {
                    myCondtion.push(filterCondtion[0])
                }
            })
    }
    console.log("myCondtion", initialValues)
    const [conditions, setConditions] = useState(myCondtion)

    const onValuesChange = (value) => {
        expGraph.getEdgeById(nodeId).setLabels({
            attrs: {
                text: {
                    text: value.name,
                },
            },
        })
        if (nodeId) {
            expGraph.renameNode(nodeId, value)
        }
    }

    React.useEffect(() => {
        form.setFieldsValue(initialValues)
        console.log(conditions)
        console.log(nodeId)
        let myCondtion = []
        if (nodeId && expGraph.getEdgeById(nodeId)) {
            initialValues = expGraph.getEdgeById(nodeId).store.data.data
            console.log("这是", initialValues)
            initialValues.condition &&
                initialValues.condition.map((item, index) => {
                    console.log(item)
                    let filterCondtion = condition.filter((list) => {
                        return list.key === item
                    })
                    if (filterCondtion && filterCondtion[0]) {
                        myCondtion.push(filterCondtion[0])
                    }
                })
        }
        setConditions(myCondtion)
    }, [activeExperiment, nodeId])
    // console
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onValuesChange={onValuesChange}
            requiredMark={false}
        >
            <Form.Item name="name" label="连线名称">
                <Input placeholder="请输入连线名称" />
            </Form.Item>
            {/* <Form.Item name="condition" label={"选择意图"}>
                <Input placeholder="请输入意图" />
            </Form.Item> */}
            <Form.Item label={"选择条件"}>
                {conditions.map((item, index) => {
                    return (
                        <Tag
                            closable
                            onClose={(data) => {
                                console.log(data)
                                console.log(item)
                                let conditionList = new Set(
                                    initialValues.condition
                                )
                                // console.log(initialValues.condition)
                                expGraph.renameNode(nodeId, { condition: null })
                                conditionList.delete(item.key)
                                console.log([...conditionList])
                                expGraph.renameNode(nodeId, {
                                    condition: [...conditionList],
                                })
                                console.log("expGraph11", expGraph)
                                console.log(initialValues)
                            }}
                            onClick={() => {
                                setActionType("edit")
                                setType("condition")
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
                        setTagIndex(conditions.length)
                        setVisible(true)
                        setDefaultValue({})
                        setType("condition")
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
                    keyIndex={expGraph.getEdgeById(nodeId).id + "-" + tagIndex}
                    experimentId={experimentId}
                    visible={visible}
                    actions={actions}
                    conditionList={initialValues.condition}
                    conditions={conditions}
                    nodeId={nodeId}
                    handleVisible={setVisible}
                    defaultValue={defaultValue}
                    setActions={setActions}
                    setConditions={setConditions}
                />
            )}
        </Form>
    )
}
