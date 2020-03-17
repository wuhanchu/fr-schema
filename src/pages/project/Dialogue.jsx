import React from "react"
import {
    Divider,
    Form,
    Popconfirm,
    Modal,
    Avatar,
    Row,
    Col,
    Input,
    Button,
    Card
} from "antd"
import schemas from "@/schemas"
import CharRecords from "@/components/Extra/Chat/ChatRecords"
import mySvg from "../../assets/userhead.svg"
import rebotSvg from "../../assets/rebot.svg"

class Dialogue extends React.Component {
    state = {
        sendValue: "",
        data: []
    }

    handleSend = async sendValue => {
        const { record } = this.props

        this.state.data.push({
            actions: null,
            content: sendValue,
            id: this.state.data.length + 1,
            role: "interlocutors"
        })
        this.setState({ data: this.state.data, sendValue: "" })
        const response = await schemas.question.service.search({
            search: sendValue.replace(/\s+/g, "|"),
            project_id: record.id
        })
        let list
        if (response.list.length > 3) {
            list = response.list.slice(0, 3)
        } else {
            list = response.list
        }
        this.state.data.push({
            content: (
                <div
                    dangerouslySetInnerHTML={{
                        __html:
                            response.list[0] &&
                            response.list[0].answer_mark &&
                            response.list[0].compatibility > 0.7
                                ? response.list[0].answer_mark
                                : "暂时未找到您要的信息"
                    }}
                ></div>
            ),
            actions:
                response.list[0] &&
                response.list[0].answer_mark &&
                response.list[0].compatibility < 0.7
                    ? [
                          <div>
                              <div>猜你想问：</div>

                              {list.length ? (
                                  list.map((data, item) => {
                                      return (
                                          <div
                                              key={
                                                  "comment-list-reply-to-" +
                                                  item
                                              }
                                          >
                                              <span>{item + 1 + "."}</span>
                                              <a
                                                  onClick={() => {
                                                      this.handleSend(
                                                          data.question_standard
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
                      ]
                    : null,
            id: this.state.data.length + 1,
            role: "my"
        })
        let card = document.getElementById("card")
        console.log(card)

        setTimeout(() => {
            card.scrollTop = card.scrollHeight
        }, 100)
        console.log(this.state.data)
        this.setState({ data: this.state.data })
    }

    renderFooter() {
        const { sendValue } = this.state
        return (
            <Row style={{ margin: "10px 10px" }}>
                <Col lg={21}>
                    <Input
                        value={this.state.sendValue}
                        onChange={e => {
                            this.setState({ sendValue: e.target.value })
                        }}
                        placeholder={"请输入消息".toString()}
                        onPressEnter={this.handleSend.bind(this, sendValue)}
                        disabled={this.state.action}
                    ></Input>
                </Col>
                <Col lg={3}>
                    <Button
                        disabled={this.state.action}
                        type="primary"
                        onClick={this.handleSend.bind(this, sendValue)}
                    >
                        发送
                    </Button>
                </Col>
            </Row>
        )
    }
    render() {
        return (
            <Modal
                visible={this.props.visibleDialogue}
                onCancel={() => {
                    this.props.handleHideDialogue()
                }}
                title={"对话"}
                width={900}
                // height={500}
                // style={{height: "500px", overflowY: "scroll"}}
                footer={this.renderFooter()}
            >
                <Card
                    bordered={null}
                    style={{
                        margin: "-24px",
                        height: "500px",
                        overflow: "scroll",
                        overflowX: "hidden"
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
            </Modal>
        )
    }
}

export default Dialogue
