import React from "react"
import { Form, Input, Tag } from "antd"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FolderAddTwoTone } from "@ant-design/icons"

export const GlobalForm = ({ name, nodeId, experimentId }) => {
    const [form] = Form.useForm()

    const expGraph = useExperimentGraph(experimentId)
    let { action, condtion } = expGraph.formData
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{}}
            requiredMark={false}
        >
            <Form.Item label="行为定义">
                {action.map((item, index) => {
                    return <Tag>{item.name}</Tag>
                })}
                <Tag color="#2db7f5">+</Tag>
            </Form.Item>
            <Form.Item label={"提交定义"}>
                {condtion.map((item, index) => {
                    return <Tag>{item.name}</Tag>
                })}
            </Form.Item>
        </Form>
    )
}
