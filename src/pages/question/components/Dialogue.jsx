import React, { Fragment } from "react"
import {
    AutoComplete,
    Avatar,
    Button,
    Card,
    Input,
    Radio,
    Spin,
    Popconfirm,
    Form,
    Checkbox,
} from "antd"
import schemas from "@/schemas"
import utils from "@/outter/fr-schema-antd-utils/src"
import mySvg from "../../../outter/fr-schema-antd-utils/src/components/GlobalHeader/my.svg"
import rebotSvg from "../../../assets/rebot.svg"
import { LoadingOutlined, SettingOutlined } from "@ant-design/icons"

const height = window.screen.height * 0.5
const width = window.screen.width
const scoHeight = height * 0.7 + "px"

const { url } = utils.utils

class Dialogue extends React.Component {
    constructor(props) {
        super(props)
        const { record, location } = props
        this.state = {
            mockDetail: [],
            inputValue: "",
            isSpin: false,
            iphoneHeight: height * 0.82,
            conversationId: "",
            type: "chat",
            serviceId: record.talk_service_id,
        }
        this.chatRef = React.createRef()
        this.inputRef = React.createRef()
    }
    render() {
        let { mockDetail, iphoneHeight } = this.state
        return (
            <div style={{ ...styles.contentSt }}>
                <div
                    style={{ ...styles.recordDetailView }}
                    // className={style.}
                    ref={this.chatRef}
                >
                    {mockDetail.map((item, index) =>
                        item.type === "right"
                            ? this.renderOtherMessage(item, index)
                            : this.renderSelfMessage(item, index)
                    )}
                    {this.state.isSpin &&
                        this.renderSelfMessage(
                            {
                                content: (
                                    <>
                                        <LoadingOutlined />
                                    </>
                                ),
                                messageType: "load",
                                onlyRead: true,
                                buttons: undefined,
                                name: "智能客服",
                                time: new Date(),
                                type: "left",
                            },
                            100
                        )}
                </div>
                {this.renderInput()}
            </div>
        )
    }

    // 自身消息
    renderSelfMessage(item, index) {
        let { clientStyle } = item
        let { mockDetail } = this.state

        return (
            <>
                <div style={styles.msgItemView} key={`self${index}`}>
                    <div
                        style={{
                            width: "30px",
                            marginRight: "8px",
                            position: "relative",
                        }}
                    >
                        <Avatar
                            style={{ position: "absolute", top: "10px" }}
                            src={rebotSvg}
                        />
                    </div>
                    <div style={{ position: "relative" }}>
                        <div
                            style={{
                                fontSize: "12px",
                                position: "absolute",
                                width: width * 0.4,
                            }}
                        >
                            {item.name}{" "}
                        </div>
                        <div
                            style={{
                                ...styles.msgView,
                                marginRight: "15px",
                                marginTop: "25px",
                                maxWidth: "526.5px",
                                img: { width: "100px" },
                                ...clientStyle,
                            }}
                        >
                            {item.messageType === "load" ? (
                                item.content
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: item.content,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {item.buttons && (
                    <div
                        style={{
                            marginLeft: "60px",
                            marginRight: "60px",
                            // marginTop: "-10px",
                        }}
                    >
                        {item.buttons.map((data, indexs) => {
                            return (
                                <a
                                    onClick={async () => {
                                        let {
                                            serviceId,
                                            conversationId,
                                        } = this.state
                                        if (this.state.isSpin === true) {
                                            return
                                        }
                                        // if (index + 1 === mockDetail.length) {
                                        this.setState({ isSpin: true })
                                        // mockDetail[
                                        //     index
                                        // ].buttons[indexs].isClick = true

                                        mockDetail[index].buttons = mockDetail[
                                            index
                                        ].buttons.map((item, ind) => {
                                            if (ind === indexs) {
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
                                        })

                                        if (data.payload[0] !== "/") {
                                            let msg = {
                                                content: data.payload,
                                                name: "我",
                                                time: new Date(),
                                                avatar:
                                                    "http://img.binlive.cn/6.png",
                                                type: "right",
                                            }
                                            mockDetail.push(msg)
                                            this.setState(
                                                {
                                                    mockDetail: [...mockDetail],
                                                },
                                                (_) => this.scrollToBottom()
                                            )
                                        }
                                        let res
                                        let list = []

                                        if (this.state.type == "chat") {
                                            res = await schemas.domain.service.message(
                                                {
                                                    service_id: serviceId,
                                                    conversation_id: conversationId,
                                                    text: data.payload,
                                                }
                                            )
                                            res.data &&
                                                res.data.map((data) =>
                                                    list.push({
                                                        content: data.text,
                                                        onlyRead: true,
                                                        buttons: data.buttons,
                                                        name: "智能客服",
                                                        time: new Date(),
                                                        avatar:
                                                            "http://img.binlive.cn/6.png",
                                                        type: "left",
                                                    })
                                                )
                                        } else {
                                            res = await schemas.domain.service.flowMessage(
                                                {
                                                    domain_key: this.props
                                                        .record.key,
                                                    conversation_id: conversationId,
                                                    text: data.payload,
                                                }
                                            )
                                            list.push({
                                                content: res.data.result.text,
                                                onlyRead: true,
                                                buttons:
                                                    res.data.result.buttons,
                                                name: "智能客服",
                                                time: new Date(),
                                                avatar:
                                                    "http://img.binlive.cn/6.png",
                                                type: "left",
                                            })
                                        }

                                        // 消息推进list 清空当前消息
                                        this.setState(
                                            {
                                                mockDetail: [
                                                    ...mockDetail,
                                                    ...list,
                                                ],
                                                isSpin: false,
                                            },
                                            (_) => this.scrollToBottom()
                                        )
                                        // }
                                    }}
                                    style={{
                                        ...styles.msgView,
                                        marginRight: "15px",
                                        marginTop: "3px",
                                        marginBottom: "10px",
                                        letterSpacing: "1px",
                                        backgroundColor:
                                            index + 1 === mockDetail.length
                                                ? "#1890ff"
                                                : data.isClick === true
                                                ? "#bae7ff"
                                                : "#ccc",
                                        color:
                                            index + 1 === mockDetail.length
                                                ? "#fff"
                                                : "#000",
                                        ...clientStyle,
                                        fontSize: "12px",
                                        display: "inline-block",
                                    }}
                                >
                                    {data.title}
                                </a>
                            )
                        })}
                    </div>
                )}
            </>
        )
    }

    // 他人消息
    renderOtherMessage(item, index) {
        let { clientStyle } = item
        return (
            <div
                style={{ ...styles.msgItemView, justifyContent: "flex-end" }}
                key={`other${index}`}
            >
                <div style={styles.msgInfoView}>
                    <div
                        style={{
                            ...styles.msgView,
                            // marginTop: "25px",
                            float: "right",
                            maxWidth: "61.8%",
                            ...clientStyle,
                        }}
                    >
                        {item.content}
                    </div>
                </div>
                <div
                    style={{
                        width: "30px",
                        marginRight: "15px",
                        position: "relative",
                    }}
                >
                    <Avatar
                        style={{ position: "absolute", top: "1px" }}
                        src={mySvg}
                    />
                </div>
            </div>
        )
    }

    renderInput() {
        let {
            inputValue,
            projectList,
            flowList,
            defaultProject,
            checkboxValue,
            serviceId,
            conversationId,
        } = this.state
        let options = []
        let flowOption = []
        projectList &&
            projectList.map((item, index) => {
                options.push({
                    label: item.name,
                    value: item.id,
                    defaultChecked: true,
                })
            })
        flowList &&
            flowList.map((item, index) => {
                flowOption.push({
                    label: item.key,
                    value: item.key,
                    defaultChecked: true,
                })
            })
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
        }
        const { type } = this.state
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: height * 0.08 + "px",
                }}
            >
                <div
                    onClick={(_) => this.inputRef.current.focus()}
                    style={{ width: "100%", marginTop: "15px" }}
                >
                    <Input
                        // style={styles.inputStyle}
                        value={inputValue}
                        onChange={(e) =>
                            this.setState({ inputValue: e.target.value })
                        }
                        onKeyPress={this.onInputEnter}
                        placeholder="请输入内容"
                        ref={this.inputRef}
                    />
                </div>
                {
                    <Popconfirm
                        title={() => {
                            return (
                                <div style={{ width: "400px" }}>
                                    设置
                                    <br />
                                    <div
                                        style={{
                                            height: "30px",
                                            width: "100%",
                                        }}
                                    ></div>
                                    <Form
                                        name="validate_other"
                                        {...formItemLayout}
                                        // onFinish={onFinish}
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
                                                    message:
                                                        "Please pick an item!",
                                                },
                                            ]}
                                        >
                                            <Radio.Group
                                                onChange={(props) => {
                                                    this.setState({
                                                        type:
                                                            props.target.value,
                                                    })
                                                    console.log(props)
                                                }}
                                            >
                                                <Radio.Button value="chat">
                                                    闲聊
                                                </Radio.Button>
                                                <Radio.Button
                                                    value="flow"
                                                    disabled={!flowList.length}
                                                >
                                                    话术
                                                </Radio.Button>
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
                                                <Radio.Group
                                                    value={this.state.flow_key}
                                                    defaultChecked
                                                    onChange={(data) => {
                                                        this.setState({
                                                            flow_key:
                                                                data.target
                                                                    .value,
                                                        })
                                                    }}
                                                    options={flowOption}
                                                ></Radio.Group>
                                            </Form.Item>
                                        )}
                                    </Form>
                                </div>
                            )
                        }}
                        onConfirm={async (data) => {
                            this.setState({
                                defaultProject: checkboxValue,
                            })

                            if (this.state.type == "flow") {
                                let res = await schemas.domain.service.flowConversation(
                                    {
                                        domain_key: this.props.record.key,
                                        flow_key: this.state.flow_key,
                                    }
                                )
                                this.setState({
                                    conversationId: res.conversation_id,
                                })
                            } else {
                                if (
                                    this.state.checkboxValue &&
                                    this.state.checkboxValue.length
                                ) {
                                    await schemas.domain.service.message({
                                        service_id: serviceId,
                                        conversation_id: conversationId,
                                        text:
                                            `/slot{"project\_id":"` +
                                            checkboxValue.join(",") +
                                            `"}`,
                                    })
                                }
                            }
                        }}
                        onCancel={() => {
                            this.setState({
                                checkboxValue: defaultProject,
                            })
                        }}
                        okText="确定"
                    >
                        <Button style={styles.sendButton}>
                            <SettingOutlined />
                        </Button>
                    </Popconfirm>
                }

                <Button
                    // size=""
                    type="primary"
                    disabled={this.state.isSpin}
                    style={styles.sendButton}
                    onClick={(_) => this.onSendMessage()}
                >
                    发送
                </Button>
            </div>
        )
    }

    // 发送消息
    async onSendMessage() {
        let { inputValue, mockDetail, serviceId, conversationId } = this.state
        // 无内容或者只存在空格 不发送
        if (this.state.isSpin === true) {
            return
        }
        if (
            !inputValue.replace(/[\r\n]/g, "") ||
            !inputValue.replace(/[ ]/g, "")
        ) {
            return
        }
        this.setState({ isSpin: true })
        try {
            let msg = {
                content: inputValue,
                name: "我",
                time: new Date(),
                avatar: "http://img.binlive.cn/6.png",
                type: "right",
            }
            mockDetail.push(msg)
            this.setState(
                { mockDetail: [...mockDetail], inputValue: "" },
                (_) => this.scrollToBottom()
            )
            let res
            let list = []

            if (this.state.type == "chat") {
                res = await schemas.domain.service.message({
                    service_id: serviceId,
                    conversation_id: conversationId,
                    text: inputValue,
                })
                res.data &&
                    res.data.map((item) =>
                        list.push({
                            content: item.text,
                            buttons: item.buttons,
                            name: "智能客服",
                            time: new Date(),
                            avatar: "http://img.binlive.cn/6.png",
                            type: "left",
                        })
                    )
            } else {
                res = await schemas.domain.service.flowMessage({
                    domain_key: this.props.record.key,
                    conversation_id: conversationId,
                    text: inputValue,
                })
                console.log(res)
                list.push({
                    content: res.data.result.text,
                    onlyRead: true,
                    buttons: res.data.result.buttons,
                    name: "智能客服",
                    time: new Date(),
                    avatar: "http://img.binlive.cn/6.png",
                    type: "left",
                })
            }

            // 消息推进list 清空当前消息
            this.setState(
                { mockDetail: [...mockDetail, ...list], isSpin: false },
                (_) => this.scrollToBottom()
            )
        } catch (error) {
            this.setState({ isSpin: false })
        }
    }

    // 聊天窗口默认显示 最后聊天记录
    scrollToBottom() {
        this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight
    }

    // 输入框点击回车
    onInputEnter = (event) => {
        if (event.which === 13) {
            this.onSendMessage()
        }
    }

    // 创建会话 获取会话id
    async getChatRecord() {
        let { serviceId, mockDetail } = this.state
        this.setState({
            isSpin: true,
        })
        let res = await schemas.domain.service.conversation({
            service_id: serviceId,
            slot: { domain_key: this.props.record.key },
        })
        mockDetail.push({
            content: "您好，请问有什么可以帮您？",
            name: "智能客服",
            time: new Date(),
            avatar: "http://img.binlive.cn/6.png",
            type: "left",
        })
        this.setState({
            conversationId: res.data.id,
            mockDetail: [...mockDetail],
            isSpin: false,
        })
    }
    async componentDidMount() {
        this.getChatRecord()
        this.scrollToBottom()
        let project = await schemas.project.service.get({
            limit: 10000,
            domain_key: this.props.record.key,
        })
        // let flow = await schemas.flow.service.get({
        //     limit: 10000,
        //     domain_key: this.props.record.key,
        // })
        let defaultProject = []
        project.list.map((item, index) => {
            defaultProject.push(item.id)
        })
        console.log(defaultProject)
        this.setState({
            projectList: project.list,
            // flowList: flow.list,
            flowList: [],

            flow_key: flow.list.length ? flow.list[0].key : undefined,
            defaultProject,
            checkboxValue: defaultProject,
        })
    }
}

const styles = {
    contentSt: {
        // backgroundColor: "#000000",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        width: "100%",
    },
    msgItemView: {
        display: "flex",
        marginLeft: "15px",
        marginBottom: "10px",
    },
    msgAvatar: {
        width: "30px",
        height: "30px",
        borderRadius: "15px",
    },
    msgView: {
        backgroundColor: "#ffffff",
        fontSize: "14px",
        paddingLeft: "10px",
        paddingRight: "10px",
        borderRadius: "5px",
        paddingTop: "6px",
        paddingBottom: "6px",
    },
    msgInfoView: {
        marginRight: "10px",
        position: "relative",
        width: "90%",
    },
    recordDetailView: {
        backgroundColor: "#F0F2F5",
        height: height * 0.92 + "px",
        paddingTop: "24px",
        overflow: "auto",
    },
    inputStyle: {
        width: "100%",
        paddingLeft: "15px",
        display: "flex",
        alignItems: "center",
        height: height * 0.05 + "px",
        borderWidth: 0.5,
        borderRadius: "8px",
        borderColor: "#333333",
        fontSize: "14px",
    },
    sendButton: {
        marginLeft: "15px",
        marginTop: "15px",
    },
    extra: {
        backgroundColor: "#ffffff",
        fontSize: "14px",
        paddingLeft: "10px",
        paddingRight: "10px",
        borderRadius: "5px",
        paddingTop: "6px",
        paddingBottom: "6px",
    },
}
export default Dialogue
