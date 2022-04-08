import React from "react"
import { autobind } from "core-decorators"
import AceEditor from "react-ace"
import {
    Button,
    Radio,
    Popconfirm,
    Form,
    Checkbox,
    Divider,
    message,
    Spin,
} from "antd"
import schemas from "@/schemas"
import { SettingOutlined, LoadingOutlined } from "@ant-design/icons"
import Chat from "@/pages/question/components/Chat"
import Modal from "antd/lib/modal/Modal"
import utils from "@/outter/fr-schema-antd-utils/src"
const { url } = utils.utils
@autobind
class Dialogue extends Chat {
    constructor(props) {
        super(props)
        const { record } = props
        console.log(url.getUrlParams("roomHeight"))
        this.state = {
            ...this.state,
            conversationId: "",
            type: props.dialogueType ? props.dialogueType : "chat",
            serviceId: record && record.talk_service_id,
            options: [],
            flowOption: [],
            flow_key: props.flowKey ? props.flowKey : undefined,
            historyId: "",
            resultFlowLength: 1,
            showSetting: false,
            settingSpin: true,
            domain_key:
                (record && record.key) || url.getUrlParams("domain_key"),
            roomHeight: url.getUrlParams("roomHeight")
                ? url.getUrlParams("roomHeight") + "px"
                : "500px",
            // collapse: false,
            showIntentFlow: true,
        }
    }

    formRef = React.createRef()

    async componentDidMount() {
        super.componentDidMount()
        console.log(url.getUrlParams("showIntentFlow"))
        if (url.getUrlParams("showIntentFlow") !== undefined) {
            this.setState({
                showIntentFlow:
                    url.getUrlParams("showIntentFlow") === "false"
                        ? false
                        : true,
            })
        }
        if (url.getUrlParams("flow_key")) {
            let flowList = await schemas.flow.service.get({
                key: "eq." + url.getUrlParams("flow_key"),
            })
            if (flowList && flowList.list && flowList.list[0]) {
                this.setState({
                    type: "flow",
                    flow_key: url.getUrlParams("flow_key"),
                    domain_key: flowList.list[0].domain_key,
                })
            }
        }
        if (url.getUrlParams("project_id")) {
            let domain = await schemas.project.service.get({
                id: "eq." + url.getUrlParams("project_id"),
            })
            if (domain && domain.list && domain.list[0]) {
                this.setState({
                    domain_key: domain.list[0].domain_key,
                })
            }
        }

        if (this.props.dialogueType || url.getUrlParams("flow_key")) {
            await this.onChatTypeConfirm()
        } else {
            await this.getChatRecord()
        }

        this.chatRef.current && this.scrollToBottom()
        this.getSettingData()
    }

    componentWillUnmount() {
        if (this.state.conversationId && this.state.domain_key)
            schemas.domain.service.closeConversation({
                domain_key: this.state.domain_key,
                conversation_id: this.state.conversationId,
            })
        this.setState({
            conversationId: undefined,
        })
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

    debounce(otherObj, value) {
        // this.timeout = null;
        let _this = this
        console.log(otherObj)
        // return  ()=> {

        // }
        if (_this.timeout) {
            clearTimeout(_this.timeout)
        }
        console.log("data")
        _this.timeout = setTimeout(async () => {
            console.log("执行")
            let data = await schemas.entity.service.get({
                ...otherObj,
                name: "like.*" + value + "*",
                select: "id,name",
            })
            let dataSource = []
            data.list.map((item) => {
                dataSource.push(item.name)
            })
            if (_this.state.inputValue === value) {
                _this.setState({
                    open: true,
                    dataSource,
                })
            }
        }, 300)
    }

    handleChange = async (value) => {
        const { allData, messageList } = this.state
        if (
            messageList.length - 1 > -1 &&
            messageList[messageList.length - 1].expect_entity_scope
        ) {
            this.setState({
                inputValue: value,
            })
            let otherStr = messageList[
                messageList.length - 1
            ].expect_entity_scope
                .replace(/&/g, '","')
                .replace(/=/g, '":"')
            let otherObj = JSON.parse('{"' + otherStr + '"}')
            if (value) this.debounce(otherObj, value)
            else {
                this.setState({ open: false })
            }
        } else {
            this.setState({
                inputValue: value,
                open: true,
                dataSource:
                    value &&
                    allData &&
                    allData.filter((item) => item.indexOf(value) >= 0),
            })
        }
    }

    // 输入框扩展
    inputExtra() {
        let { defaultProject, isSpin, isFlow, slot, showSetting } = this.state
        let canSend = true
        if (slot) {
            try {
                JSON.parse(slot)
            } catch (error) {
                canSend = false
            }
        }
        return (
            <>
                <Button
                    onClick={() => {
                        this.setState({
                            showSetting: true,
                        })
                    }}
                    style={styles.sendButton}
                    disabled={isSpin}
                >
                    <SettingOutlined />
                </Button>
                {isFlow && (
                    <Button
                        disabled={isSpin}
                        style={styles.sendButton}
                        onClick={async (_) => this.onResetChatType()}
                    >
                        重置
                    </Button>
                )}
                {showSetting && this.renderMoreSetting()}
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
            <div style={{ width: "650px" }}>
                {/* 设置
                <br/> */}
                <div
                    style={{
                        height: "30px",
                        width: "100%",
                    }}
                />
                <Form
                    name="validate_other"
                    ref={this.formRef}
                    {...formItemLayout}
                    initialValues={{
                        type: type,
                        flow_key,
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
                        <Form.Item label="问题库">
                            <Checkbox.Group
                                defaultChecked
                                onChange={(data) => {
                                    this.setState({
                                        checkboxValue: data,
                                    })
                                    this.handleGetHotWord(
                                        this.state.domainArray,
                                        data.join(",")
                                    )
                                }}
                                options={options}
                                value={checkboxValue}
                            />
                        </Form.Item>
                    )}
                    {type === "flow" && (
                        <Form.Item
                            name="flow_key"
                            label="流程"
                            rules={[
                                {
                                    required: true,
                                    message: "请选择流程",
                                },
                            ]}
                        >
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
                    {type === "flow" && (
                        <Form.Item label="槽位">
                            <div style={{ width: "462px" }}>
                                <AceEditor
                                    placeholder={`请输入${"槽位"}`}
                                    mode="json"
                                    // theme="tomorrow"
                                    name="blah2"
                                    wrapEnabled={true}
                                    onChange={(res) => {
                                        try {
                                            this.setState({
                                                slot: res,
                                            })
                                        } catch (error) {
                                            console.log(error)
                                        }
                                    }}
                                    fontSize={14}
                                    showPrintMargin
                                    showGutter
                                    width={"462px"}
                                    // style={props.style}
                                    height={"220px"}
                                    highlightActiveLine
                                    value={this.state.slot}
                                    markers={[
                                        {
                                            startRow: 0,
                                            startCol: 2,
                                            endRow: 1,
                                            endCol: 20,
                                            className: "error-marker",
                                            type: "background",
                                        },
                                    ]}
                                    setOptions={{
                                        enableBasicAutocompletion: true,
                                        enableLiveAutocompletion: true,
                                        enableSnippets: true,
                                        showLineNumbers: true,
                                        tabSize: 2,
                                        useWorker: false,
                                    }}
                                />
                            </div>
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
            messages.map((data) => {
                if (data.text) {
                    list.push({
                        ...data,
                        content: data.text,
                        onlyRead: true,
                        buttons: data.buttons,
                        name: "智能客服",
                        time: new Date(),
                        type: "left",
                    })
                }
            })
            this.setState({ isSpin: false })
        } else {
            list.push({
                content: messages.content,
                name: "我",
                time: new Date(),
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
            res = await schemas.domain.service.message({
                domain_key,
                conversation_id: conversationId,
                text: data.payload,
            })
            if (res.data) {
                this.arrPush(res.data, "left")
                this.setState({
                    resultFlowLength: res.data.length,
                })
            }
        } catch (error) {
            if (this.state.conversationId) {
                message.error(error.message)
            }
            this.setState({ isSpin: false })
        }
        this.onSendMessageAfter()
    }

    // 设置
    renderMoreSetting() {
        return (
            <Modal
                okText={"确定"}
                cancelText={"取消"}
                visible={true}
                title={"设置"}
                width={800}
                onOk={() => this.onChatTypeConfirm()}
                onCancel={() => {
                    this.setState({
                        showSetting: false,
                    })
                }}
            >
                <Spin tip="加载中" spinning={this.state.settingSpin}>
                    {this.renderSetting()}
                </Spin>
            </Modal>
        )
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
                                key={`extraButton${index}${indexs}`}
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
            slot,
        } = this.state
        if (!this.props.dialogueType && this.formRef.current)
            this.formRef.current.validateFields()
        if (type === "flow" && !flow_key) {
            return
        }

        this.setState({ defaultProject: checkboxValue, isSpin: true })
        let param = { historyId: messageList.length - 1 }
        let res
        if (type === "flow") {
            let slotObj
            try {
                slotObj = slot ? JSON.parse(slot) : undefined
            } catch (error) {
                message.error("槽位输入不正确！")
                this.setState({ isSpin: false })
                return
            }
            if (flow_key) {
                res = await schemas.domain.service.conversation({
                    type: "flow",
                    domain_key,
                    flow_key,
                    slot: slotObj
                        ? { env: "testing", ...slotObj }
                        : { env: "testing" },
                })
                param.conversationId = res.data.id
                param.isFlow = true
                if (url.getUrlParams("flow_key")) {
                    if (url.getUrlParams("showIntentFlow") === "true") {
                        param.showIntentFlow = true
                    } else {
                        param.showIntentFlow = false
                    }
                } else {
                    param.showIntentFlow = true
                }
                this.setState({ ...param }, (_) => this.onSendMsg("/true"))
            }
        } else {
            if (checkboxValue && checkboxValue.length) {
                res = await schemas.domain.service.conversation({
                    type: "chat",
                    domain_key,
                    slot: {
                        domain_key: domain_key,
                        project_id: url.getUrlParams("project_id") || undefined,
                        // env: "testing"
                    },
                })
                try {
                    await schemas.domain.service.message({
                        domain_key,
                        conversation_id: res.data.id,
                        text:
                            `/slot{"project\_id":"` +
                            checkboxValue.join(",") +
                            `"}`,
                    })
                    param.conversationId = res.data.id
                    param.isFlow = false
                } catch (error) {
                    if (this.state.conversationId) {
                        message.error(error.message)
                    }
                }

                // param.showIntentFlow = false
            }
            this.setState({ isSpin: false })
        }
        this.setState({ ...param, resultFlowLength: 1, showSetting: false })
    }

    // 重置
    async onResetChatType() {
        let {
            type,
            messageList,
            conversationId,
            flow_key,
            domain_key,
            slot,
        } = this.state
        if (type === "flow") {
            this.setState({ isSpin: true, historyId: messageList.length - 1 })
            await schemas.domain.service.closeConversation({
                domain_key,
                conversation_id: conversationId,
            })
            let slotObj
            try {
                slotObj = slot ? JSON.parse(slot) : undefined
            } catch (error) {
                message.error("槽位输入不正确！")
                return
                // slotObj = undefined
            }
            let res = await schemas.domain.service.conversation({
                type: "flow",
                domain_key,
                flow_key,
                slot: slotObj
                    ? { env: "testing", ...slotObj }
                    : { env: "testing" },
            })
            this.setState({
                conversationId: res.data.id,
                isSpin: false,
                showIntentFlow: true,
            })
            this.setState({ showIntentFlow: true }, (_) =>
                this.onSendMsg("/true")
            )
        }
    }

    // 发送消息
    async onSendMessage(value) {
        let {
            inputValue,
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
            if (value && value[0] !== "/") {
                this.arrPush({ content: value }, "right")
            }
            let res
            if (value === "/true") {
                value = ""
            }
            try {
                res = await schemas.domain.service.message({
                    domain_key,

                    conversation_id: conversationId,
                    text: value || inputValue,
                })
                if (res.data) {
                    this.arrPush(res.data, "left")
                    this.setState({
                        resultFlowLength: res.data.length,
                    })
                }
            } catch (error) {
                if (this.state.conversationId) {
                    message.error(error.message)
                }
                this.setState({ isSpin: false })
            }
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
            domain_key,
            type: "chat",
            slot: {
                domain_key: domain_key,
                project_id: url.getUrlParams("project_id") || undefined,
                // env: "testing"
            },
        })

        messageList.push({
            content: "您好，请问有什么可以帮您？",
            name: "智能客服",
            time: new Date(),
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
            select: "id,name,key,domain_key",
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
                    key: item.id,

                    defaultChecked: true,
                })
            })
        flow.list &&
            flow.list.map((item) => {
                flowOption.push({
                    key: item.key,
                    label: item.name,
                    value: item.key,
                    defaultChecked: true,
                })
            })
        this.setState({
            projectList: project.list,
            settingSpin: false,
            flowList: flow.list,
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
