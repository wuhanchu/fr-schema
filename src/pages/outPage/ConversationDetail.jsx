import React from "react"
import { autobind } from "core-decorators"
import Chat from "@/pages/question/components/Chat"
import schema from "@/schemas/conversation/detail"
import domainSchema from "@/schemas/domain/index"
import schemaConversation from "@/schemas/conversation/list"
import { listToDict } from "@/outter/fr-schema/src/dict"
import WaveSurfer from "wavesurfer.js"

@autobind
class ConversationDetail extends Chat {
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
            showInput: false,
            roomHeight: this.props.roomHeight || "100vh",
            collapse: false,
            loading: true,
            showRedoOutlined: true,
        }
    }
    onCollapse() {
        if (this.props.phone_audio_url) {
            let time = 0
            this.setState({ isPlay: false })
            if (this.wavesurfer) {
                time = this.wavesurfer.getCurrentTime()
                this.wavesurfer.destroy()
            }
            console.log(time)
            var wavesurfer = WaveSurfer.create({
                container: "#waveform",
                waveColor: "#777",
                progressColor: "#1890ff",
                height: 40,
                xhr: {
                    cache: "default",
                    mode: "cors",
                    method: "GET",
                },
            })
            let url =
                BASE_PATH +
                "/file_server" +
                this.props.phone_audio_url
                    .replace(/^http:\/\/[^/]+/, "")
                    .replace(/^https:\/\/[^/]+/, "")
            wavesurfer.load(url)
            wavesurfer.on("ready", function () {
                wavesurfer.play(time)
                wavesurfer.playPause()
            })
            this.wavesurfer = wavesurfer
        }
    }
    async componentDidMount() {
        this.init()
        this.initFlow()
        this.onCollapse()
    }

    async init() {
        let { location } = this.props
        let showIntentFlow = this.props.showIntentFlow
        // 外链
        if (location && location.pathname.startsWith("/outter")) {
            showIntentFlow =
                location.query &&
                location.query.showIntentFlow &&
                location.query.showIntentFlow === "true"
        }
        let conversation_id =
            this.props.conversation_id ||
            this.props.location.query.conversation_id
        let flow_key = undefined
        let domain_key = undefined
        if (
            this.props.location &&
            this.props.location.query &&
            this.props.location.query.call_id
        ) {
            let res = await schemaConversation.service.get({
                limit: 10000,
                call_id: this.props.location.query.call_id,
                // order: "create_time",
            })

            conversation_id = res && res.list && res.list[0] && res.list[0].id
            flow_key = res && res.list && res.list[0] && res.list[0].flow_key
            domain_key =
                res && res.list && res.list[0] && res.list[0].domain_key
        }
        let list = []
        let buttons = []
        if (conversation_id) {
            let res = await schema.service.get({
                limit: 10000,
                conversation_id: conversation_id,
                order: "create_time",
            })
            res.list.map((item) => {
                if (item.type === "reply" && item.text) {
                    let recommend_text = []
                    if (item.result && item.result.recommend_text) {
                        recommend_text = item.result.recommend_text
                    }
                    list.push({
                        recommend_text,
                        content: item.text,
                        onlyRead: true,
                        name: "智能客服",
                        time: new Date(),
                        avatar: "http://img.binlive.cn/6.png",
                        type: "left",
                    })
                    if (
                        item.result &&
                        item.result.buttons &&
                        item.result.buttons.length
                    ) {
                        buttons.push(...item.result.buttons)
                    }
                    if (item.result && Array.isArray(item.result)) {
                        item.result.map((one) => {
                            console.log(one)
                            if (one.buttons && one.buttons.length) {
                                buttons.push(...one.buttons)
                            }
                        })
                    }
                }
                if (item.type === "receive" && item.text && item.node_key) {
                    list.push({
                        result: item.result,
                        content: item.text,
                        name: "我",
                        time: new Date(),
                        avatar: "http://img.binlive.cn/6.png",
                        type: "right",
                    })
                }
            })
            console.log(listToDict(buttons, "", "payload", "title"))
            this.setState({
                messageList: list,
                flow_key: this.props.flow_key,
                domain_key: this.props.domain_key,
                conversationId: this.props.conversation_id,
                showIntentFlow,
                loading: false,
                buttons: listToDict(buttons, "", "payload", "title"),
            })
        } else {
            this.setState({
                loading: false,
            })
        }
        if (
            this.props.location &&
            this.props.location.query &&
            this.props.location.query.call_id
        ) {
            this.setState({
                conversationId: conversation_id,
                flow_key,
                domain_key,
            })
        }
    }
}

export default ConversationDetail
