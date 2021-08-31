import React from "react"
import { Input, Form, Button, Space, Row, Col, Select } from "antd"
import "antd/lib/style/index.css"
import Modal from "antd/lib/modal/Modal"
import clone from "clone"
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"

function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

export const ConditionModal = ({
    visible,
    handleVisible,
    conditionType,
    conditions,
    defaultValue,
    graph,
    cell,
    intenList,
    handleChangeShowCondition,
    graphChange,
}) => {
    const expGraph = graph
    let condition = []
    if (graph) {
        condition = expGraph.condition
    }
    let initialValues = clone(defaultValue)
    let slot = []
    if (defaultValue.slot) {
        Object.keys(defaultValue.slot).forEach(function (key) {
            slot.push({ first: key, last: defaultValue.slot[key] })
        })
    }

    initialValues.slot = slot
    let conditionList = []
    if (cell && cell.getData && cell.getData().condition) {
        conditionList = cell.getData().condition
    }

    const onFinish = (values) => {
        let slot = {}
        let myConditions = clone(conditions)

        values.slot &&
            values.slot.map((item) => {
                slot[item.first] = item.last || null
            })
        if (conditionType === "add") {
            let conditionKey = cell.id + `${Date.now()}`
            myConditions.push({
                ...values,
                key: conditionKey,
                slot,
            })
            conditionList.push(conditionKey)
            cell.setData({ condition: conditionList })
            let expGraphCondition = [...graph.condition]
            expGraphCondition.push({
                ...values,
                key: conditionKey,
                slot,
            })
            graph.condition = null
            graph.condition = expGraphCondition
            graphChange()
        } else {
            if (expGraph.condition) {
                let arr = expGraph.condition.map((item) => {
                    if (item.key === defaultValue.key) {
                        return { ...values, slot, key: defaultValue.key }
                    }
                    return item
                })
                myConditions = myConditions.map((item) => {
                    if (item.key === defaultValue.key) {
                        return { ...values, slot, key: defaultValue.key }
                    }
                    return item
                })
                expGraph.condition = arr
                graphChange()
            }
        }

        handleVisible(false)
        handleChangeShowCondition()
    }

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo)
    }

    let formRef = React.createRef()

    let options = []
    intenList &&
        intenList.map((item) => {
            options.push(
                <Select.Option value={item.key}>{item.name}</Select.Option>
            )
        })
    const onValuesChange = (value) => {
        if (value.type) {
            formRef.current.setFieldsValue({ name: dict[value.type].remark })
        }
    }
    return (
        <Modal
            title={"条件配置"}
            visible={visible}
            destroyOnClose={true}
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
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: "请输入名称！" }]}
                >
                    <Input placeholder={"请输入名称"} />
                </Form.Item>

                <Form.Item label="意图" name="intent">
                    <Select
                        showSearch
                        placeholder={"请选择意图"}
                        defaultActiveFirstOption={false}
                        // showArrow={false}
                        filterOption={(input, option) =>
                            option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                        notFoundContent={null}
                    >
                        {options}
                    </Select>
                </Form.Item>

                <Form.List name="slot">
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
                                <Row gutter={24}>
                                    <Col lg={16}>
                                        <Button
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            添加插槽
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
