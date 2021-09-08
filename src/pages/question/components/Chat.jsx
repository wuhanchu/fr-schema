import React from "react"
import { autobind } from "core-decorators"
import { Button, Input } from "antd"
import robotSvg from "@/assets/rebot.svg"
import mySvg from "@/outter/fr-schema-antd-utils/src/components/GlobalHeader/my.svg"

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
            messageList: [],
            isSpin: false,
            inputValue: "",
            showInput: true,
            roomHeight: "500px",
        }
        this.chatRef = React.createRef()
        this.inputRef = React.createRef()
    }

    render() {
        let { showInput } = this.state
        return (
            <div style={{ ...styles.contentSt }}>
                {this.renderChatView()}
                {showInput && this.renderInput()}
            </div>
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
                    {/*<div style={{ display: 'flex', alignItems: 'center' }}>*/}
                    {/*    <span>*/}
                    {/*        {item.name}{' '}*/}
                    {/*        /!*{moment(item.sendTime).format('YYYY-MM-DD HH:mm:ss')}*!/*/}
                    {/*    </span>*/}
                    {/*</div>*/}
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
        return (
            <div
                style={styles.leaveMsgView}
                dangerouslySetInnerHTML={{ __html: item.content }}
            />
        )
    }

    // 客户
    renderCostumer(item, index) {
        return (
            <div style={styles.chatRightItem} key={`leave${index}`}>
                <div style={styles.chatRightMsgItem}>
                    <div
                        style={styles.chatRightMsgView}
                        dangerouslySetInnerHTML={{ __html: item.content }}
                    />
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
                    onClick={(_) => this.onSendMessage()}
                >
                    发送
                </Button>
            </div>
        )
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
            await this.onSendMessage()
        }
    }

    // 发送消息
    onSendMessage() {}

    // 聊天窗口默认显示 最后聊天记录
    scrollToBottom() {
        this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight
    }
}

const styles = {
    contentSt: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        width: "100%",
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
}

export default Chat
