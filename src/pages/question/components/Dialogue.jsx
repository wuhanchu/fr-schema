import React, { Fragment } from "react"
import { AutoComplete, Avatar, Button, Card, Input, Spin } from "antd"
import schemas from "@/schemas"
import CharRecords from "@/components/Extra/Chat/ChatRecords"
import mySvg from "../../../assets/userhead.svg"
import rebotSvg from "../../../assets/rebot.svg"
import utils from "@/outter/fr-schema-antd-utils/src"
import style from "@/global.less"
import * as _ from "lodash"
import { downloadFile } from "@/utils/minio"

const { url } = utils.utils

class Dialogue extends React.Component {
    state = {
        dataSource: [],
        sendValue: "",
        isSpin: false,
        data: [
            {
                actions: null,
                content: "您有什么问题？",
                id: 0,
                role: "my",
            },
        ],
    }

    constructor(props) {
        super(props)
        const { record } = props
        this.project_id = url.getUrlParams("project_id") || record.id
    }

    componentDidMount() {
        schemas.question.service
            .get({ project_id: this.project_id, limit: 999 })
            .then((response) => {
                let allData = []
                response.list.forEach((item) => {
                    allData.push(item.question_standard)
                })
                this.allData = allData
            })
    }

    handleChange = (value) => {
        this.setState({
            sendValue: value,
            dataSource:
                this.allData &&
                this.allData.filter((item) => item.indexOf(value) >= 0),
        })
    }

    handleSend = async () => {
        const { sendValue } = this.state

        if (_.isNil(sendValue)) {
            return
        }

        this.state.data.push({
            actions: null,
            content: sendValue,
            id: this.state.data.length + 1,
            role: "interlocutors",
        })
        let card = document.getElementById("card")
        setTimeout(() => {
            card.scrollTop = card.scrollHeight
        }, 10)
        this.setState({ data: this.state.data, sendValue: "", isSpin: true })
        const response = await schemas.question.service.search({
            search: sendValue,
            project_id: this.project_id,
        })
        let list
        if (response.list.length > 3) {
            list = response.list.slice(0, 3)
        } else {
            list = response.list
        }
        this.state.data.push({
            content: (
                <>
                    <div
                        dangerouslySetInnerHTML={{
                            __html:
                                response.list[0] &&
                                response.list[0].answer &&
                                response.list[0].compatibility > 0.9
                                    ? response.list[0].answer
                                    : "暂时未找到您要的信息",
                        }}
                    />
                    {response.list[0] &&
                        response.list[0].attachment &&
                        response.list[0].compatibility > 0.9 &&
                        response.list[0].attachment.length !== 0 && (
                            <div>
                                <div style={{ marginTop: "10px" }}>附件:</div>
                                {response.list[0].attachment.map(
                                    (itemStr, index) => {
                                        let item = JSON.parse(itemStr)
                                        return (
                                            <a
                                                style={{ marginRight: "20px" }}
                                                onClick={() => {
                                                    downloadFile(
                                                        item.bucketName,
                                                        item.fileName,
                                                        item.url
                                                    )
                                                }}
                                            >
                                                {item.fileName}
                                            </a>
                                            //     <Card
                                            //         bodyStyle={{ padding: 0 }}
                                            //         bordered={false}
                                            //         onClick={() => {
                                            //             let href = downloadFile(
                                            //                 item.bucketName,
                                            //                 item.fileName,
                                            //                 item.url
                                            //             )
                                            //         }}
                                            //     >
                                            //         <Card.Meta
                                            //             description={
                                            //                 <div
                                            //                     style={{
                                            //                         height:
                                            //                             "22px",
                                            //                         overflow:
                                            //                             "hidden",
                                            //                     }}
                                            //                 >
                                            //                     {item.fileName}
                                            //                 </div>
                                            //             }
                                            //         />
                                            //     </Card>
                                            // </Card.Grid>
                                        )
                                    }
                                )}
                            </div>
                        )}
                </>
            ),
            actions: response.list[0] &&
                response.list[0].answer_mark &&
                (response.list[0].compatibility < 0.9 ||
                    sendValue.length < 10) && [
                    <Fragment>
                        {sendValue.length < 10 &&
                            response.list[0].compatibility > 0.9 && (
                                <div>
                                    <div>匹配问题：</div>

                                    {list.length ? (
                                        <div
                                            key={"comment-list-reply-to-" + -1}
                                        >
                                            <span>{}</span>
                                            <a
                                                onClick={() => {
                                                    this.setState(
                                                        {
                                                            sendValue:
                                                                list[0]
                                                                    .question_standard,
                                                        },
                                                        this.handleSend
                                                    )
                                                }}
                                            >
                                                {list[0].question_standard}
                                            </a>
                                        </div>
                                    ) : (
                                        <a>没猜到哦！请输入详细信息。</a>
                                    )}
                                </div>
                            )}

                        {(list.length > 1 || sendValue.length < 10) && (
                            <div>
                                {!(
                                    sendValue.length < 10 &&
                                    response.list[0].compatibility > 0.9 &&
                                    list.length == 1
                                ) && <div>猜你想问：</div>}

                                {list.length > 0 || sendValue.length < 10 ? (
                                    list.map((data, index) => {
                                        if (
                                            index == 0 &&
                                            sendValue.length < 10
                                        ) {
                                            if (
                                                sendValue.length < 10 &&
                                                response.list[0].compatibility >
                                                    0.9
                                            ) {
                                                return null
                                            }
                                            return (
                                                <div
                                                    key={
                                                        "comment-list-reply-to-" +
                                                        index
                                                    }
                                                >
                                                    <span>{index + ": "}</span>
                                                    <a
                                                        onClick={() => {
                                                            this.setState(
                                                                {
                                                                    sendValue:
                                                                        data.question_standard,
                                                                },
                                                                this.handleSend
                                                            )
                                                        }}
                                                    >
                                                        {data.question_standard}
                                                    </a>
                                                </div>
                                            )
                                        }
                                        if (index != 0)
                                            return (
                                                <div
                                                    key={
                                                        "comment-list-reply-to-" +
                                                        index
                                                    }
                                                >
                                                    <span>{index + ": "}</span>
                                                    <a
                                                        onClick={() => {
                                                            this.setState(
                                                                {
                                                                    sendValue:
                                                                        data.question_standard,
                                                                },
                                                                this.handleSend
                                                            )
                                                        }}
                                                    >
                                                        {data.question_standard}
                                                    </a>
                                                </div>
                                            )
                                    })
                                ) : (
                                    <a>没猜到哦！请输入详细信息。</a>
                                )}
                            </div>
                        )}
                    </Fragment>,
                ],
            id: this.state.data.length + 1,
            role: "my",
        })

        setTimeout(() => {
            card.scrollTop = card.scrollHeight
        }, 100)
        console.log(this.state.data)
        this.setState({ data: this.state.data, isSpin: false })
    }

    renderFooter() {
        const { sendValue } = this.state
        const others = {}
        if (_.isNil(sendValue) || sendValue === "") {
            others.value = ""
        }
        return (
            <div
                style={{
                    height: "42px",
                    border: "none",
                    padding: 0,
                    flex: "0, 0, 62px",
                    marginLeft: "20px",
                    marginRight: "20px",
                }}
            >
                <div style={{ width: "100%", display: "flex", height: "42px" }}>
                    <AutoComplete
                        dropdownMatchSelectWidth={252}
                        style={{ width: "100%" }}
                        onChange={(value) => {
                            this.handleChange(value)
                        }}
                        onSelect={(value) => {
                            this.selectOpen = true
                        }}
                        dataSource={this.state.dataSource}
                        {...others}
                    >
                        <Input
                            onPressEnter={(e) => {
                                setTimeout(() => {
                                    if (this.selectOpen) {
                                        this.selectOpen = false
                                    } else {
                                        !this.selectOpen && this.handleSend()
                                    }
                                })
                            }}
                        ></Input>
                    </AutoComplete>
                    <div style={{ flex: "0 0 74px", marginLeft: "20px" }}>
                        <Button
                            disabled={this.state.action}
                            type="primary"
                            onClick={this.handleSend}
                        >
                            发送
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <Fragment>
                <div
                    style={{
                        width: "100%",
                        height: this.props.height ? this.props.height : "100%",
                    }}
                >
                    <Spin
                        tip="回答中。。。"
                        spinning={this.state.isSpin}
                        wrapperClassName={style.Spins}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Card
                                bordered={null}
                                style={{
                                    margin: "0px",
                                    flex: 1,
                                    // width: "98%",
                                    padding: "0",
                                    overflow: "scroll",
                                    overflowX: "hidden",
                                }}
                                ref={"card"}
                                id="card"
                            >
                                <CharRecords
                                    status={0 && 1 ? "ongoing" : ""}
                                    goingTip={"暂无数据"}
                                    iconMy={<Avatar src={rebotSvg} />}
                                    iconInterlocutors={<Avatar src={mySvg} />}
                                    value={this.state.data}
                                ></CharRecords>
                            </Card>
                            {this.renderFooter()}
                        </div>
                    </Spin>
                </div>
            </Fragment>
        )
    }
}

export default Dialogue
