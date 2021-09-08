import React from "react"
import { autobind } from "core-decorators"
import {
    Button,
    Radio,
    Popconfirm,
    Form,
    Checkbox,
    Divider,
    message,
} from "antd"
import schemas from "@/schemas"
import { SettingOutlined, LoadingOutlined } from "@ant-design/icons"
import Chat from "@/pages/question/components/Chat"

@autobind
class Dialogue extends Chat {
    constructor(props) {
        super(props)
        const { record } = props
        this.state = {
            ...this.state,
            conversationId: "",
            type: "chat",
            serviceId: record.talk_service_id,
            options: [],
            flowOption: [],
            flow_key: "",
            historyId: "",
            resultFlowLength: 1,
            domain_key: record.key,
        }
    }

    async componentDidMount() {
        await this.getChatRecord()
        this.scrollToBottom()
        this.getSettingData()
    }

    renderService(item, index) {
        let { historyId } = this.state
        return (
            <div>
                {super.renderService(item, index)}
                {index === historyId &&
                    this.renderDivider({ content: "以上为历史消息" })}
            </div>
        )
    }

    // 输入框扩展
    inputExtra() {
        let { defaultProject, isSpin, isFlow } = this.state
        return (
            <>
                <Popconfirm
                    disabled={isSpin}
                    title={() => this.renderSetting()}
                    onConfirm={async () => this.onChatTypeConfirm()}
                    onCancel={() => {
                        this.setState({
                            checkboxValue: defaultProject,
                        })
                    }}
                    okText="确定"
                >
                    <Button style={styles.sendButton} disabled={isSpin}>
                        <SettingOutlined />
                    </Button>
                </Popconfirm>
                {isFlow && (
                    <Button
                        disabled={isSpin}
                        style={styles.sendButton}
                        onClick={async (_) => this.onResetChatType()}
                    >
                        重置
                    </Button>
                )}
            </>
        )
    }

    // 设置
    renderSetting() {
        let {
            type,
            flowList,
            checkboxValue,
            options,
            flowOption,
            flow_key,
        } = this.state
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
        }
        return (
            <div style={{ width: "400px" }}>
                设置
                <br />
                <div
                    style={{
                        height: "30px",
                        width: "100%",
                    }}
                />
                <Form
                    name="validate_other"
                    {...formItemLayout}
                    initialValues={{
                        type: type,
                    }}
                >
                    <Form.Item
                        name="type"
                        label="对话类型"
                        rules={[
                            {
                                required: true,
                                message: "请选择其中一项",
                            },
                        ]}
                    >
                        <Radio.Group
                            onChange={(props) => {
                                this.setState({ type: props.target.value })
                            }}
                        >
                            <Radio.Button value="chat">闲聊</Radio.Button>
                            <Radio.Button value="flow">话术</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    {type === "chat" && options.length > 0 && (
                        <Form.Item label="知识库">
                            <Checkbox.Group
                                defaultChecked
                                onChange={(data) => {
                                    this.setState({
                                        checkboxValue: data,
                                    })
                                }}
                                options={options}
                                value={checkboxValue}
                            />
                        </Form.Item>
                    )}
                    {type === "flow" && (
                        <Form.Item label="流程">
                            {flowList.length ? (
                                <Radio.Group
                                    value={flow_key}
                                    defaultChecked
                                    onChange={(data) => {
                                        this.setState({
                                            flow_key: data.target.value,
                                        })
                                    }}
                                    options={flowOption}
                                />
                            ) : (
                                "暂无话术"
                            )}
                        </Form.Item>
                    )}
                </Form>
            </div>
        )
    }

    arrPush(messages, type) {
        let list = []
        let { messageList } = this.state
        if (type === "left") {
            messages.map((data) =>
                list.push({
                    content: data.text,
                    onlyRead: true,
                    buttons: data.buttons,
                    name: "智能客服",
                    time: new Date(),
                    avatar: "http://img.binlive.cn/6.png",
                    type: "left",
                })
            )
            this.setState({ isSpin: false })
        } else {
            list.push({
                content: messages.content,
                name: "我",
                time: new Date(),
                avatar: "http://img.binlive.cn/6.png",
                type: "right",
            })
        }
        this.setState(
            {
                messageList: [...messageList, ...list],
                inputValue: "",
            },
            (_) => this.scrollToBottom()
        )
    }

    async operaClick(data, index, buttonIndex) {
        let {
            messageList,
            type,
            serviceId,
            conversationId,
            isSpin,
            domain_key,
            resultFlowLength,
        } = this.state
        if (isSpin === true) {
            return
        }
        if (index + resultFlowLength < messageList.length && type === "flow") {
            return
        }
        this.setState({ isSpin: true })
        messageList[index].buttons = messageList[index].buttons.map(
            (item, ind) => {
                if (ind === buttonIndex) {
                    return {
                        ...item,
                        isClick: true,
                    }
                } else {
                    return {
                        ...item,
                        isClick: false,
                    }
                }
            }
        )

        if (data.payload[0] !== "/") {
            this.arrPush({ content: data.payload }, "right")
        }
        let res
        try {
            if (type === "chat") {
                res = await schemas.domain.service.message({
                    service_id: serviceId,
                    conversation_id: conversationId,
                    text: data.payload,
                })
                if (res.data) {
                    this.arrPush(res.data, "left")
                }
            } else {
                res = await schemas.domain.service.flowMessage({
                    domain_key,
                    conversation_id: conversationId,
                    text: data.payload,
                })
                if (res.data && res.data.result) {
                    this.arrPush(res.data.result, "left")
                    this.setState({
                        resultFlowLength: res.data.result.length,
                    })
                }
            }
        } catch (error) {
            message.error(error.message)
        }
    }

    // 机器人回复扩展
    renderLeftExtra(item, index) {
        let { messageList, resultFlowLength } = this.state
        return (
            item.buttons && (
                <div
                    style={{
                        marginRight: "60px",
                        marginTop: "10px",
                    }}
                >
                    {item.buttons.map((data, indexs) => {
                        return (
                            <a
                                onClick={this.operaClick.bind(
                                    this,
                                    data,
                                    index,
                                    indexs
                                )}
                                style={{
                                    ...styles.msgView,
                                    marginRight: "15px",
                                    marginTop: "3px",
                                    marginBottom: "10px",
                                    letterSpacing: "1px",
                                    backgroundColor:
                                        index + resultFlowLength >=
                                        messageList.length
                                            ? "#1890ff"
                                            : data.isClick === true
                                            ? "#bae7ff"
                                            : "#ccc",
                                    color:
                                        index + resultFlowLength >=
                                        messageList.length
                                            ? "#fff"
                                            : "#000",
                                    fontSize: "12px",
                                    display: "inline-block",
                                }}
                            >
                                {data.title}
                            </a>
                        )
                    })}
                </div>
            )
        )
    }

    // 渲染分割线
    renderDivider(item) {
        return (
            <div>
                <Divider style={{ fontSize: "14px" }}>{item.content}</Divider>
            </div>
        )
    }

    renderChatExtra() {
        let { isSpin } = this.state
        return (
            isSpin &&
            this.renderService(
                {
                    content: (
                        <>
                            <LoadingOutlined />
                        </>
                    ),
                    messageType: "load",
                    buttons: undefined,
                    name: "智能客服",
                    time: new Date(),
                    type: "left",
                },
                100
            )
        )
    }

    // 话术类型确认
    async onChatTypeConfirm() {
        let {
            checkboxValue,
            flow_key,
            type,
            messageList,
            serviceId,
            domain_key,
        } = this.state
        this.setState({ defaultProject: checkboxValue, isSpin: true })
        let param = { historyId: messageList.length - 1 }
        let res
        if (type === "flow") {
            if (flow_key) {
                res = await schemas.domain.service.flowConversation({
                    type: "flow",
                    domain_key,
                    flow_key,
                })
                param.conversationId = res.data.id
                param.isFlow = true
                this.setState({ ...param }, (_) => this.onSendMessage("/true"))
            }
        } else {
            if (checkboxValue && checkboxValue.length) {
                res = await schemas.domain.service.conversation({
                    service_id: serviceId,
                    slot: {
                        domain_key,
                    },
                })
                await schemas.domain.service.message({
                    service_id: serviceId,
                    conversation_id: res.data.id,
                    text:
                        `/slot{"project\_id":"` +
                        checkboxValue.join(",") +
                        `"}`,
                })
                param.conversationId = res.data.id
                param.isFlow = false
            }
        }
        this.setState({ isSpin: false, ...param, resultFlowLength: 1 })
    }

    // 重置
    async onResetChatType() {
        let {
            type,
            messageList,
            conversationId,
            flow_key,
            domain_key,
        } = this.state
        if (type === "flow") {
            this.setState({ isSpin: true, historyId: messageList.length - 1 })
            await schemas.domain.service.closeConversation({
                domain_key,
                conversation_id: conversationId,
            })
            let res = await schemas.domain.service.flowConversation({
                type: "flow",
                domain_key,
                flow_key,
            })
            this.setState(
                {
                    conversationId: res.data.id,
                    isSpin: false,
                },
                (_) => this.onSendMessage("/true")
            )
        }
    }

    // 发送消息
    async onSendMessage(value) {
        let {
            inputValue,
            messageList,
            serviceId,
            conversationId,
            isSpin,
            type,
            domain_key,
        } = this.state
        // 无内容或者只存在空格 不发送
        if (!value && isSpin === true) {
            return
        }
        if (
            !value &&
            (!inputValue.replace(/[\r\n]/g, "") ||
                !inputValue.replace(/[ ]/g, ""))
        ) {
            return
        }
        this.setState({ isSpin: true })
        try {
            if (!value) {
                this.arrPush({ content: inputValue }, "right")
            }
            let res

            if (type === "chat") {
                res = await schemas.domain.service.message({
                    service_id: serviceId,
                    conversation_id: conversationId,
                    text: inputValue ? inputValue : "",
                })
                if (res.data) {
                    this.arrPush(res.data, "left")
                }
            } else {
                try {
                    res = await schemas.domain.service.flowMessage({
                        domain_key,
                        conversation_id: conversationId,
                        text: inputValue,
                    })
                    if (res.data && res.data.result) {
                        this.arrPush(res.data.result, "left")
                        this.setState({
                            resultFlowLength: res.data.result.length,
                        })
                    }
                } catch (error) {
                    message.error(error.message)
                }
            }
            // 消息推进list 清空当前消息
        } catch (error) {
            this.setState({ isSpin: false })
        }
    }

    // 创建会话 获取会话id
    async getChatRecord() {
        let { serviceId, messageList, domain_key } = this.state
        this.setState({
            isSpin: true,
        })
        let res = await schemas.domain.service.conversation({
            service_id: serviceId,
            slot: { domain_key },
        })

        messageList.push({
            content: "您好，请问有什么可以帮您？",
            name: "智能客服",
            time: new Date(),
            avatar: "http://img.binlive.cn/6.png",
            type: "left",
        })
        this.setState({
            conversationId: res.data.id,
            messageList: [...messageList],
            isSpin: false,
        })
    }

    async getSettingData() {
        let { domain_key } = this.state
        let project = await schemas.project.service.get({
            limit: 10000,
            domain_key: domain_key,
        })
        let flow
        flow = await schemas.flow.service.get({
            limit: 10000,
            domain_key: domain_key,
        })
        let defaultProject = []
        project.list.map((item) => {
            defaultProject.push(item.id)
        })
        let options = []
        let flowOption = []
        project.list &&
            project.list.map((item) => {
                options.push({
                    label: item.name,
                    value: item.id,
                    defaultChecked: true,
                })
            })
        flow.list &&
            flow.list.map((item) => {
                flowOption.push({
                    label: item.name,
                    value: item.key,
                    defaultChecked: true,
                })
            })
        this.setState({
            projectList: project.list,
            flowList: flow.list,
            flow_key: flow && flow.list.length ? flow.list[0].key : undefined,
            defaultProject,
            checkboxValue: defaultProject,
            options: [...options],
            flowOption: [...flowOption],
        })
    }
}

const styles = {
    msgView: {
        backgroundColor: "#ffffff",
        fontSize: "14px",
        paddingLeft: "10px",
        paddingRight: "10px",
        borderRadius: "5px",
        paddingTop: "6px",
        paddingBottom: "6px",
    },
    sendButton: {
        marginLeft: "15px",
        marginTop: "15px",
    },
}
export default Dialogue
