import React from "react"
import { Form, Input } from "antd"
import { useObservableState } from "@/common/hooks/useObservableState"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"

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

    const onValuesChange = async ({ name }: { name: string }) => {
        if (node.name !== name) {
            await expGraph.renameNode(nodeId, name)
        }
    }

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ name: node ? node.name : "" }}
            onValuesChange={onValuesChange}
            requiredMark={false}
        >
            <Form.Item label="节点名称" name="name">
                <Input placeholder="input placeholder" />
            </Form.Item>
            <Form.Item name={"type"} label={"节点类型"}>
                <Input placeholder="请输入节点类型" />
            </Form.Item>
            <Form.Item label="操作">
                <Input placeholder="请选择操作" />
            </Form.Item>
        </Form>
    )
}
