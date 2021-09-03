import React from "react"
import service from "@/schemas/domain/index"
import {
    Collapse,
    Spin,
    Tag,
    message,
    Tooltip,
    Empty,
    Modal,
    Button,
    Input,
    Card,
    Form,
    Skeleton,
    List,
    Typography,
} from "antd"

const { Panel } = Collapse

class IntentIdentify extends React.Component {
    state = {
        result: [],
        loading: true,
        success: false,
        isSpin: false,
    }

    renderContent() {
        const onFinish = async (values) => {
            console.log("Success:", values)
            this.setState({ isSpin: true })
            let response = await service.service.intentIdentify({
                domain_key: this.props.record.key,
                text: values.text,
            })
            this.setState({
                data: response.data,
                isSpin: false,
            })
            console.log(response.data)
        }

        const onFinishFailed = (errorInfo) => {
            console.log("Failed:", errorInfo)
        }

        return (
            <>
                <div>
                    <Form
                        name="basic"
                        layout={"inline"}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            label="解析文本"
                            name="text"
                            rules={[
                                { required: true, message: "请输入对话文本" },
                            ]}
                        >
                            <Input
                                placeholder={"请输入对话文本"}
                                style={{ width: "400px" }}
                            />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                识别
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <Spin spinning={this.state.isSpin}>
                    <div style={{ marginTop: "10px" }}>
                        <Card>
                            {!this.state.data && <Empty />}
                            {this.state.data && (
                                <div>
                                    <div style={{ marginBottom: "10px" }}>
                                        <Typography.Text>
                                            解析文本：{this.state.data.text}
                                        </Typography.Text>
                                    </div>
                                    <div style={{ marginBottom: "10px" }}>
                                        <Typography.Text>
                                            识别的意图：
                                            {this.state.data.intent &&
                                                this.state.data.intent.name}
                                        </Typography.Text>
                                    </div>
                                    <div style={{ marginBottom: "10px" }}>
                                        <Typography.Text>
                                            匹配文本：
                                            {this.state.data.intent &&
                                            this.state.data.intent.match_regex || this.state.data.intent.match_standard_discourse}
                                        </Typography.Text>
                                    </div>
                                    <List
                                        header={<div>意图排名</div>}
                                        footer={false}
                                        size="small"
                                        bordered
                                        dataSource={
                                            this.state.data.intent_ranking
                                        }
                                        renderItem={(item) => (
                                            <List.Item>
                                                <Skeleton
                                                    avatar
                                                    title={false}
                                                    loading={item.loading}
                                                    active
                                                >
                                                    <List.Item.Meta
                                                        title={
                                                            <Tooltip
                                                                placement="topLeft"
                                                                title={
                                                                    item.match_regex
                                                                }
                                                            >
                                                                <a>
                                                                    {item.name}
                                                                </a>
                                                            </Tooltip>
                                                        }
                                                    />
                                                    <div>
                                                        {item.compatibility}
                                                    </div>
                                                </Skeleton>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                </Spin>
            </>
        )
    }

    render() {
        return (
            <>
                {
                    <Modal
                        visible
                        onCancel={() => this.props.onCancel(false)}
                        title="意图识别"
                        footer={false}
                        onOk={() => {
                            this.setState({
                                result: [],
                                loading: true,
                                success: false,
                            })
                        }}
                        width={"630px"}
                        maskClosable
                    >
                        {this.renderContent()}
                    </Modal>
                }
            </>
        )
    }
}

export default IntentIdentify
