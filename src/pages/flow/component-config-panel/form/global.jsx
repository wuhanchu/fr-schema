import React, { useState } from "react"
import { Form, Input, Tag } from "antd"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FormModal } from "./formModal"
import { FolderAddTwoTone } from "@ant-design/icons"

export const GlobalForm = ({ name, nodeId, experimentId }) => {
    const [form] = Form.useForm()

    const [visible, setVisible] = useState(false)
    const [type, setType] = useState("action")
    const [actionType, setActionType] = useState("add")

    const expGraph = useExperimentGraph(experimentId)
    let { action, condition } = expGraph.formData
    const [actions, setActions] = useState(action)
    const [condtions, setConditions] = useState(condition)
    const [defaultValue, setDefaultValue] = useState({})

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{}}
            requiredMark={false}
        >
            <Form.Item label="行为定义">
                {action.map((item, index) => {
                    return (
                        <Tag
                            onClick={() => {
                                setActionType("edit")
                                setDefaultValue(item)
                                setType("action")
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
                        setDefaultValue({})
                        setType("action")
                        setVisible(true)
                    }}
                    color="#2db7f5"
                >
                    +
                </Tag>
            </Form.Item>
            <Form.Item label={"提交定义"}>
                {condition.map((item, index) => {
                    return <Tag>{item.name}</Tag>
                })}
                <Tag
                    onClick={() => {
                        setActionType("add")
                        setVisible(true)
                        setType("condition")
                        console.log(visible)
                    }}
                    color="#2db7f5"
                >
                    +
                </Tag>
            </Form.Item>
            {visible && (
                <FormModal
                    actionType={actionType}
                    type={type}
                    experimentId={experimentId}
                    visible={visible}
                    actions={actions}
                    condtions={condtions}
                    handleVisible={setVisible}
                    setActions={setActions}
                    setConditions={setConditions}
                />
            )}
        </Form>
    )
}
