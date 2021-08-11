import React from "react"
import { Form, Input, Tag, Button } from "antd"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FolderAddTwoTone } from "@ant-design/icons"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"

export const FormModal = ({
    experimentId,
    visible,
    handleVisible,
    actionType,
    type,
    setActions,
    setCondtions,
    condtions,
    actions,
    defaultValue,
}) => {
    const [form] = Form.useForm()

    const expGraph = useExperimentGraph(experimentId)
    let { action, condtion } = expGraph.formData
    const onFinish = (values) => {
        let myActions = clone(actions)
        let myCondtions = clone(condtions)

        if (type === "action") {
            console.log("action, condtion", myActions, condtion)
            if (actionType === "add") {
                myActions.push({ ...values, id: "qwe-123-adfe" })
                expGraph.formData.action = myActions
                setActions(myActions)
                console.log(expGraph)
            } else {
                // actions.f
            }
        }
        if (type === "condtion") {
            if (actionType === "add") {
                myCondtions.push({ ...values, id: "qwe-123-adfe" })
                expGraph.formData.condtion = myCondtions
                setCondtions(myCondtions)
                console.log(expGraph)
            } else {
                // actions.f
            }
        }
        handleVisible(false)
        console.log("Success:", values)
    }

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo)
    }
    return (
        <Modal
            title={type == "condtion" ? "意图" : "行为"}
            visible={visible}
            footer={false}
            onCancel={() => handleVisible(false)}
        >
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: "请输入用户名！" }]}
                >
                    <Input placeholder={"请输入用户名"} />
                </Form.Item>

                {/*<Form.Item*/}
                {/*    label="意图"*/}
                {/*    name="intent"*/}
                {/*    rules={[{ required: true, message: "请输入意图！" }]}*/}
                {/*>*/}
                {/*    <Input placeholder={"请输入意图"}/>*/}
                {/*</Form.Item>*/}
                <Form.Item
                    label="节点重复次数"
                    name="node_report_time"
                    rules={[
                        { required: true, message: "请输入节点重复次数！" },
                    ]}
                >
                    <Input placeholder={"请输入节点重复次数"} />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 12 }}>
                    <Button
                        style={{ float: "right" }}
                        type="primary"
                        htmlType="submit"
                    >
                        提交
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}
