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

export const FlowFormDemo = ({ name, nodeId, experimentId }) => {
    const [form] = Form.useForm()

    const expGraph = useExperimentGraph("1")
    let initialValues = expGraph.flowConfig

    const onValuesChange = async (activeExperiment, args, data) => {
        expGraph.flowConfig = { ...args, ...activeExperiment }
    }
    return (
        <Form
            preserve={false}
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onValuesChange={onValuesChange}
            requiredMark={false}
        >
            <Form.Item
                label="域"
                name="domain_key"
                rules={[{ required: true, message: "请输入域！" }]}
            >
                <Input placeholder="请输入域" />
            </Form.Item>
            <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: "请输入名称！" }]}
            >
                <Input placeholder="请输入名称" />
            </Form.Item>
        </Form>
    )
}
