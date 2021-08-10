import React from "react"
import { Form, Input, Radio } from "antd"
import { useObservableState } from "@/common/hooks/useObservableState"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"

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

    const expGraph = useExperimentGraph(experimentId)
    const [activeExperiment] = useObservableState(expGraph.experiment$)
    let initialValues = {}
    if (nodeId && expGraph.getEdgeById(nodeId)) {
        initialValues = expGraph.getEdgeById(nodeId).store.data.data
    }
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
    }, [activeExperiment, nodeId])
    // console
    console.log("name", initialValues)
    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onValuesChange={onValuesChange}
            requiredMark={false}
        >
            <Form.Item name="name" label="意图名称">
                <Input placeholder="请输入意图名称" />
            </Form.Item>
            <Form.Item name="condition" label={"意图"}>
                <Input placeholder="请输入节点类型" />
            </Form.Item>
            <Form.Item label="操作">
                <Input placeholder="请选择操作" />
            </Form.Item>
            {/* 提交定义：<FolderAddTwoTone /> */}
        </Form>
    )
}
