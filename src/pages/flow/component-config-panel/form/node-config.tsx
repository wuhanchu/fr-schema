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
    const initialValues =
        expGraph.getNodeById(nodeId) &&
        expGraph.getNodeById(nodeId).store.data.data
    const onValuesChange = async (activeExperiment) => {
        const { name } = activeExperiment
        console.log(activeExperiment)
        console.log(expGraph.getNodes())
        // expGraph.experiment$.next({ ...activeExperiment, name: name })
        if (node.name !== name) {
            // expGraph.prop('zIndex', 10)
            await expGraph.renameNode(nodeId, activeExperiment)
        }
    }
    console.log(node)
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
                <Input placeholder="请输入是否允许重复" />
            </Form.Item>
            <Form.Item name={"allow_repeat_time"} label={"允许重复次数"}>
                <Input placeholder="请输入允许重复次数" />
            </Form.Item>
            <Form.Item name={"opeation"} label="操作">
                <Input placeholder="请选择操作" />
            </Form.Item>
        </Form>
    )
}
