import React, { Fragment } from "react"
import { AutoComplete, Avatar, Button, Card, Input, Spin } from "antd"
import schemas from "@/schemas"
import utils from "@/outter/fr-schema-antd-utils/src"
import mySvg from "../../../outter/fr-schema-antd-utils/src/components/GlobalHeader/my.svg"
import rebotSvg from "../../../assets/rebot.svg"

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
            serviceId: record.talk_service_id,
        }
        this.chatRef = React.createRef()
        this.inputRef = React.createRef()
    }
    render() {
        let { mockDetail, iphoneHeight } = this.state
        return (
            <Spin tip={"回答中.."} spinning={this.state.isSpin}>
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
                    </div>
                    {this.renderInput()}
                </div>
            </Spin>
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
                                ...clientStyle,
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: item.content,
                                }}
                            />
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
                                        this.setState({ isSpin: true })
                                        mockDetail[
                                            mockDetail.length - 1
                                        ].buttons[indexs].isClick = true

                                        if (index + 1 === mockDetail.length) {
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
                                                        mockDetail: [
                                                            ...mockDetail,
                                                        ],
                                                    },
                                                    (_) => this.scrollToBottom()
                                                )
                                            }

                                            let res = await schemas.domain.service.message(
                                                {
                                                    service_id: serviceId,
                                                    conversation_id: conversationId,
                                                    text: data.payload,
                                                }
                                            )
                                            let list = []
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
                                        }
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
        let { inputValue } = this.state
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
                <Button
                    // size=""
                    type="primary"
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
        if (
            !inputValue.replace(/[\r\n]/g, "") ||
            !inputValue.replace(/[ ]/g, "")
        ) {
            return
        }
        this.setState({ isSpin: true })

        let msg = {
            content: inputValue,
            name: "我",
            time: new Date(),
            avatar: "http://img.binlive.cn/6.png",
            type: "right",
        }
        mockDetail.push(msg)
        this.setState({ mockDetail: [...mockDetail], inputValue: "" }, (_) =>
            this.scrollToBottom()
        )
        let res = await schemas.domain.service.message({
            service_id: serviceId,
            conversation_id: conversationId,
            text: inputValue,
        })
        let list = []
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
        // 消息推进list 清空当前消息
        this.setState(
            { mockDetail: [...mockDetail, ...list], isSpin: false },
            (_) => this.scrollToBottom()
        )
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
            content: "您好，我是小K",
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
