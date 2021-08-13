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

    let initialValues = {}
    let myCondtion = []
    if (nodeId && expGraph.getEdgeById(nodeId)) {
        initialValues = expGraph.getEdgeById(nodeId).store.data.data
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
    const [conditions, setConditions] = useState(myCondtion)

    const onValuesChange = (value) => {
        expGraph.getEdgeById(nodeId).setLabels({
            attrs: {
                text: {
                    text: value.name,
                },
                body: {
                    fill: "#F7F7FA",
                },
            },
        })
        if (nodeId) {
            expGraph.renameNode(nodeId, value)
        }
    }

    React.useEffect(() => {
        form.setFieldsValue(initialValues)
        let myCondtion = []
        if (nodeId && expGraph.getEdgeById(nodeId)) {
            initialValues = expGraph.getEdgeById(nodeId).store.data.data
            initialValues.condition &&
                initialValues.condition.map((item, index) => {
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
            <Form.Item label={"条件定义"}>
                {conditions.map((item, index) => {
                    return (
                        <Tag
                            closable
                            onClose={(data) => {
                                let conditionList = new Set(
                                    initialValues.condition
                                )
                                expGraph.renameNode(nodeId, { condition: null })
                                conditionList.delete(item.key)
                                expGraph.renameNode(nodeId, {
                                    condition: [...conditionList],
                                })
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
