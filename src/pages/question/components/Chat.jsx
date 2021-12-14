import React from "react"
import { autobind } from "core-decorators"
import { Button, Input, Spin } from "antd"
import robotSvg from "@/assets/rebot.svg"
import mySvg from "@/outter/fr-schema-antd-utils/src/components/GlobalHeader/my.svg"
import ChatFlowTable from "@/pages/question/components/ChatFlowTable"
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    PlaySquareOutlined,
    SyncOutlined,
} from "@ant-design/icons"

/**
 * 聊天窗口
 * 样式统一
 * 以便于复用
 */
@autobind
class Chat extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            messageList: [], // 消息数据
            isSpin: false, // 加载
            inputValue: "", // 输入框值
            showInput: true, // 是否显示输入框
            roomHeight: "500px", // 界面高度
            showIntentFlow: false, // 显示聊天流程
            showIntent: false, // 显示意图弹窗
            intentMessage: [], // 流程数据
            conversationId: "",
            domain_key: "",
            flow_key: "",
            audio: document.createElement("AUDIO"),
            collapse: false, // 是否收缩
            loading: false,
        }
        this.chatRef = React.createRef()
        this.inputRef = React.createRef()
        this.tableRef = React.createRef()
    }

    render() {
        let { showInput, showIntentFlow, collapse } = this.state
        return (
            <Spin tip="加载中..." spinning={this.state.loading}>
                <div style={styles.contentSt}>
                    <div style={styles.chatView}>
                        {showIntentFlow && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    width: "100%",
                                    fontSize: "21px",
                                    marginBottom: "10px",
                                }}
                            >
                                {collapse ? (
                                    <MenuFoldOutlined
                                        onClick={(_) =>
                                            this.setState({ collapse: false })
                                        }
                                    />
                                ) : (
                                    <MenuUnfoldOutlined
                                        onClick={(_) =>
                                            this.setState({ collapse: true })
                                        }
                                    />
                                )}
                            </div>
                        )}
                        {this.renderChatView()}
                        {showInput && this.renderInput()}
                    </div>
                    {collapse && showIntentFlow && this.renderChatIntentFlow()}
                </div>
            </Spin>
        )
    }

    // 聊天内容展示
    renderChatView() {
        let { messageList, roomHeight } = this.state
        return (
            <div
                style={{ ...styles.leaveView, height: roomHeight }}
                ref={this.chatRef}
            >
                {messageList.map((item, index) =>
                    item.type === "left"
                        ? this.renderService(item, index)
                        : this.renderCostumer(item, index)
                )}
                {this.renderChatExtra()}
            </div>
        )
    }

    //  机器人
    renderService(item, index) {
        return (
            <div style={styles.leaveItem} key={`leave${index}`}>
                <img src={robotSvg} alt="" style={styles.avatar} />
                <div style={{ marginTop: "8px" }}>
                    {item.messageType === "load" ? (
                        <div style={styles.leaveMsgView}>{item.content}</div>
                    ) : (
                        this.renderServiceContent(item, index)
                    )}
                    {this.renderLeftExtra(item, index)}
                </div>
            </div>
        )
    }

    // 机器人回复内容
    renderServiceContent(item, index) {
        item.content = item.content && item.content
        return (
            <div
                style={styles.leaveMsgView}
                dangerouslySetInnerHTML={{ __html: item.content }}
            />
        )
    }

    componentWillUnmount() {
        const { audio } = this.state
        audio.load()
    }

    // 客户
    renderCostumer(item, index) {
        console.log(item)
        return (
            <div style={styles.chatRightItem} key={`leave${index}`}>
                <div style={styles.chatRightMsgItem}>
                    <div style={styles.chatRightMsgView}>
                        {item.content}
                        {item.result && item.result.voice_url && (
                            <>
                                {this.state.audioIndex !== index ? (
                                    <a
                                        onClick={() => {
                                            const { audio } = this.state
                                            try {
                                                audio.src =
                                                    item.result.voice_url
                                                var playPromise = audio.play()

                                                if (playPromise !== undefined) {
                                                    playPromise
                                                        .then((_) => {
                                                            // Automatic playback started!
                                                            // Show playing UI.
                                                        })
                                                        .catch((error) => {
                                                            // Auto-play was prevented
                                                            // Show paused UI.
                                                        })
                                                }
                                                audio.onended = () => {
                                                    this.setState({
                                                        audioIndex: undefined,
                                                    })
                                                }
                                            } catch (error) {}

                                            this.setState({ audioIndex: index })
                                        }}
                                        style={{ marginLeft: "5px" }}
                                    >
                                        <PlaySquareOutlined />
                                    </a>
                                ) : (
                                    <a
                                        onClick={() => {
                                            const { audio } = this.state
                                            try {
                                                audio.load()
                                            } catch (error) {}
                                            this.setState({
                                                audioIndex: undefined,
                                            })
                                        }}
                                        style={{ marginLeft: "5px" }}
                                    >
                                        <SyncOutlined spin />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <img src={mySvg} alt="" style={styles.chatRightAvatar} />
            </div>
        )
    }

    // 渲染输入框
    renderInput() {
        let { inputValue, isSpin } = this.state
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    onClick={(_) => this.inputRef.current.focus()}
                    style={{ width: "100%", marginTop: "15px" }}
                >
                    <Input
                        value={inputValue}
                        onChange={(e) =>
                            this.setState({ inputValue: e.target.value })
                        }
                        onKeyPress={this.onInputEnter}
                        placeholder="请输入内容"
                        ref={this.inputRef}
                    />
                </div>
                {this.inputExtra()}
                <Button
                    type="primary"
                    disabled={isSpin}
                    style={styles.sendButton}
                    onClick={(_) => this.onSendMsg()}
                >
                    发送
                </Button>
            </div>
        )
    }

    // 聊天过程流程展现
    renderChatIntentFlow() {
        let { roomHeight, conversationId, domain_key, flow_key } = this.state
        return (
            <div
                style={{
                    width: "50%",
                    height: roomHeight + 20,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={styles.tableStyle}>
                    {
                        <ChatFlowTable
                            defaultProject={this.state.defaultProject}
                            conversationId={conversationId}
                            domainKey={domain_key}
                            flowKey={flow_key}
                            onRef={this.getRef}
                            roomHeight={roomHeight}
                        />
                    }
                </div>

                <div style={styles.refreshButton}>
                    <div style={{ flex: 1 }} />
                    <Button
                        type="primary"
                        onClick={this.onRefresh}
                        style={{ zIndex: 9999 }}
                    >
                        刷新
                    </Button>
                </div>
            </div>
        )
    }

    getRef(ref) {
        this.tableRef = ref
    }

    onRefresh() {
        this.tableRef.refreshList()
    }

    //聊天扩展
    renderChatExtra() {
        return null
    }

    // 输入框扩展
    inputExtra() {
        return null
    }

    // 机器人回复扩展(展示在下方)
    renderLeftExtra(item, index) {
        return null
    }

    // 输入框点击回车
    onInputEnter = async (event) => {
        if (event.which === 13) {
            await this.onSendMsg()
        }
    }

    // 发送消息
    async onSendMsg(value) {
        await this.onSendMessage(value)
        this.onSendMessageAfter(value)
    }

    // 发送消息
    onSendMessage(value) {}

    // 发送之后
    async onSendMessageAfter(value) {
        if (this.state.showIntentFlow && this.state.collapse) {
            await this.tableRef.findIntentList()
            await this.tableRef.refreshList()
        }
    }

    // 聊天窗口默认显示 最后聊天记录
    scrollToBottom() {
        this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight
    }
}

const styles = {
    contentSt: {
        display: "flex",
        flex: 1,
        height: "100%",
        width: "100%",
    },
    chatView: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
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
    leaveView: {
        backgroundColor: "#F0F2F5",
        padding: "24px",
        overflowY: "auto",
    },
    leaveItem: {
        display: "flex",
        marginTop: "10px",
    },
    avatar: {
        width: "30px",
        height: "30px",
        marginRight: "10px",
    },
    leaveMsgView: {
        backgroundColor: "#fff",
        borderRadius: "0 16px 12px 16px",
        padding: "6px 16px",
        wordWrap: "break-word",
        display: "inline-block",
        wordBreak: "break-all",
    },
    chatRightItem: {
        display: "flex",
        marginTop: "10px",
        justifyContent: "flex-end",
    },
    chatRightAvatar: {
        width: "30px",
        height: "30px",
        marginLeft: "10px",
    },
    chatRightMsgView: {
        backgroundColor: "#fff",
        borderRadius: "16px 0px 16px 16px",
        padding: "6px 16px",
        wordWrap: "break-word",
        display: "inline-block",
        color: "#82161C",
    },
    chatRightMsgItem: {
        marginTop: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
    },
    refreshButton: {
        display: "flex",
        justifyContent: "space-end",
        marginTop: "-15px",
        marginRight: "23px",
    },
    tableStyle: {
        marginTop: "-48px",
        flex: 1,
    },
}

export default Chat
