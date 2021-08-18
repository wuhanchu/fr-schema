import React, { useState } from "react"
import { Form, Input, Radio, Tag, Popconfirm } from "antd"
import { useObservableState } from "@/common/hooks/useObservableState"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FormModal } from "./condtionModal"
import { CloseOutlined } from "@ant-design/icons"

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
    let myCondition = []
    if (nodeId && expGraph.getEdgeById(nodeId)) {
        initialValues = expGraph.getEdgeById(nodeId)?.getData()
        initialValues.condition &&
            initialValues.condition.map((item, index) => {
                console.log(item)
                let filterCondition = condition.filter((list) => {
                    return list.key === item
                })
                if (filterCondition && filterCondition[0]) {
                    myCondition.push(filterCondition[0])
                }
            })
    }
    const [conditions, setConditions] = useState(myCondition)

    const onValuesChange = (value) => {
        expGraph.getEdgeById(nodeId).setLabels({
            attrs: {
                text: {
                    text: value.name,
                    fontSize: 12,
                    fill: "#000000A6",
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
        let myCondition = []
        if (nodeId && expGraph.getEdgeById(nodeId)) {
            initialValues = expGraph.getEdgeById(nodeId)?.getData()
            initialValues.condition &&
                initialValues.condition.map((item, index) => {
                    let filterCondition = condition.filter((list) => {
                        return list.key === item
                    })
                    if (filterCondition && filterCondition[0]) {
                        myCondition.push(filterCondition[0])
                    }
                })
        }
        setConditions(myCondition)
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
            <Form.Item
                name="name"
                label="名称"
                rules={[{ required: true, message: "请输入名称！" }]}
            >
                <Input placeholder="请输入名称" />
            </Form.Item>
            {/* <Form.Item name="condition" label={"选择意图"}>
                <Input placeholder="请输入意图" />
            </Form.Item> */}
            <Form.Item label={"条件定义"} extra="条件之间为或的关系">
                {conditions.map((item, index) => {
                    return (
                        <Tag
                            // closable
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
                        >
                            <span
                                onClick={() => {
                                    setActionType("edit")
                                    setType("condition")
                                    setTagIndex(index)
                                    setDefaultValue(item)
                                    setVisible(true)
                                }}
                            >
                                {item.name}
                            </span>
                            <Popconfirm
                                title="是否删除此条件?"
                                onConfirm={() => {
                                    myCondition = []
                                    let conditionList = new Set(
                                        conditions.map((item) => {
                                            return item.key
                                        })
                                    )
                                    expGraph.renameNode(nodeId, {
                                        condition: null,
                                    })
                                    conditionList.delete(item.key)
                                    expGraph.renameNode(nodeId, {
                                        condition: [...conditionList],
                                    })

                                    conditionList &&
                                        conditionList.map((item, index) => {
                                            let filterCondition = condition.filter(
                                                (list) => {
                                                    return list.key === item
                                                }
                                            )
                                            if (
                                                filterCondition &&
                                                filterCondition[0]
                                            ) {
                                                myCondition.push(
                                                    filterCondition[0]
                                                )
                                            }
                                        })

                                    setConditions(myCondition)
                                }}
                                // onCancel={cancel}
                                okText="是"
                                cancelText="否"
                            >
                                <CloseOutlined />
                            </Popconfirm>
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
