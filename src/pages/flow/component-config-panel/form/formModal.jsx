import React from "react"
import { Input, Tag, Form, Button, Space, Row, Col, Select } from "antd"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import "antd/lib/style/index.css"
import { FolderAddTwoTone } from "@ant-design/icons"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"

function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

export const FormModal = ({
    experimentId,
    visible,
    handleVisible,
    actionType,
    type,
    setActions,
    actions,
    keyIndex,
    actionList,
    nodeId,
    defaultValue,
}) => {
    const [form] = Form.useForm()

    const expGraph = useExperimentGraph(experimentId)
    let { action } = expGraph.formData
    let initialValues = clone(defaultValue)
    let param = []
    if (defaultValue.param) {
        Object.keys(defaultValue.param).forEach(function (key) {
            param.push({ first: key, last: defaultValue.param[key] })
        })
    }

    initialValues.param = param
    if (!actionList) {
        actionList = []
    }

    const onFinish = (values) => {
        let param = {}
        let myActions = clone(actions)
        values.param &&
            values.param.map((item) => {
                param[item.first] = item.last
            })

        if (type === "action") {
            if (actionType === "add") {
                let actionKey = keyIndex + Random(0, 100000)
                myActions.push({
                    ...values,
                    key: actionKey,
                    param,
                })

                actionList.push(actionKey)
                if (nodeId) {
                    console.log(actionList)
                    expGraph.renameNode(nodeId, { action: actionList })
                }
                let expGraphAction = [...expGraph.formData.action]
                expGraphAction.push({
                    ...values,
                    key: actionKey,
                    param,
                })
                expGraph.formData.action = expGraphAction
                setActions(myActions)
            } else {
                if (expGraph.formData.action) {
                    let arr = expGraph.formData.action.map((item) => {
                        if (item.key === defaultValue.key) {
                            return { ...values, param, key: defaultValue.key }
                        }
                        return item
                    })
                    myActions = myActions.map((item) => {
                        if (item.key === defaultValue.key) {
                            return { ...values, param, key: defaultValue.key }
                        }
                        return item
                    })
                    setActions(myActions)
                    expGraph.formData.action = arr
                }
            }
        }
        handleVisible(false)
    }

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo)
    }

    const dict = {
        phone_play_audio: {
            value: "phone_play_audio",
            remark: "对接电话播放音频",
        },
        phone_play_tts_audio: {
            value: "phone_play_tts_audio",
            remark: "对接电话播放语音合成音频",
        },
        search: {
            value: "search",
            remark: "搜索知识库",
        },
        transfer_manual: {
            value: "transfer_manual",
            remark: "转人工",
        },
    }
    let formRef = React.createRef()

    let options = []
    Object.keys(dict).forEach((key) => {
        options.push(
            <Select.Option value={key}>{dict[key].remark}</Select.Option>
        )
    })
    const onValuesChange = (value) => {
        console.log("修改", form, formRef)
        if (value.type) {
            console.log("修改名称")
            formRef.current.setFieldsValue({ name: dict[value.type].remark })
        }
        console.log(formRef.current.getFieldsValue())
    }
    return (
        <Modal
            title={"行为配置"}
            visible={visible}
            footer={false}
            onCancel={() => handleVisible(false)}
        >
            <Form
                name="basic"
                ref={formRef}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                onValuesChange={onValuesChange}
                initialValues={initialValues}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label="类型"
                    name="type"
                    rules={[{ required: true, message: "请输入类型！" }]}
                >
                    <Select placeholder="请输入类型" style={{ width: "100%" }}>
                        {options}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: "请输入名称！" }]}
                >
                    <Input
                        placeholder={"请输入名称"}
                        defaultValue={initialValues.name}
                    />
                </Form.Item>

                <Form.List name="param">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(
                                ({ key, name, fieldKey, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{ display: "flex" }}
                                        align="baseline"
                                    >
                                        <Form.Item
                                            {...restField}
                                            wrapperCol={{ offset: 8, span: 12 }}
                                            name={[name, "first"]}
                                            fieldKey={[fieldKey, "first"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "请输入键名",
                                                },
                                            ]}
                                        >
                                            <Input placeholder="键名" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "last"]}
                                            fieldKey={[fieldKey, "last"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "请输入键值",
                                                },
                                            ]}
                                        >
                                            <Input
                                                style={{
                                                    width: "236px",
                                                    marginLeft: "-26px",
                                                }}
                                                placeholder="键值"
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined
                                            onClick={() => remove(name)}
                                        />
                                    </Space>
                                )
                            )}
                            <Form.Item wrapperCol={{ offset: 8, span: 12 }}>
                                {/* <Button type="dashed" style={{ float: 'right', width: '236px', position: 'absolute', right: '0px' }} onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加插槽
                                </Button> */}
                                <Row gutter={24}>
                                    <Col lg={16}>
                                        <Button
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            添加参数
                                        </Button>
                                    </Col>
                                    <Col lg={8}>
                                        <Button
                                            style={{ float: "right" }}
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            提交
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    )
}
