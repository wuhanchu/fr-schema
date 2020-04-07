import React, { Fragment } from "react"
import {
    Divider,
    Form,
    Popconfirm,
    Modal,
    Spin,
    Avatar,
    Row,
    Col,
    Input,
    Button,
    Card
} from "antd"
import schemas from "@/schemas"
import CharRecords from "@/components/Extra/Chat/ChatRecords"
import mySvg from "../../../assets/userhead.svg"
import rebotSvg from "../../../assets/rebot.svg"
import utils from "@/outter/fr-schema-antd-utils/src/utils"
import style from "./Dialogue.less"

const { url } = utils

class Dialogue extends React.Component {
    state = {
        sendValue: "",
        isSpin: false,
        data: [
            {
                actions: null,
                content: "您有什么问题？",
                id: 0,
                role: "my"
            }
        ]
    }

    handleSend = async sendValue => {
        const { record } = this.props
        let project_id = url.getUrlParams("project_id") || record.id

        this.state.data.push({
            actions: null,
            content: sendValue,
            id: this.state.data.length + 1,
            role: "interlocutors"
        })
        let card = document.getElementById("card")
        setTimeout(() => {
            card.scrollTop = card.scrollHeight
        }, 10)
        this.setState({ data: this.state.data, sendValue: "", isSpin: true })
        const response = await schemas.question.service.search({
            search: sendValue.replace(/\s+/g, "|"),
            project_id: project_id
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
                            response.list[0].compatibility > 0.9
                                ? response.list[0].answer_mark
                                : "暂时未找到您要的信息"
                    }}
                ></div>
            ),
            actions:
                response.list[0] &&
                response.list[0].answer_mark &&
                (response.list[0].compatibility < 0.9 || sendValue.length < 10)
                    ? (sendValue.length > 10 ||
                          response.list[0].compatibility < 0.9) &&
                      list.length <= 1
                        ? null
                        : [
                              <Fragment>
                                  {sendValue.length < 10 &&
                                      response.list[0].compatibility > 0.9 && (
                                          <div>
                                              <div>匹配问题：</div>

                                              {list.length ? (
                                                  <div
                                                      key={
                                                          "comment-list-reply-to-" +
                                                          -1
                                                      }
                                                  >
                                                      <span>{}</span>
                                                      <a
                                                          onClick={() => {
                                                              this.handleSend(
                                                                  list[0]
                                                                      .question_standard
                                                              )
                                                          }}
                                                      >
                                                          {
                                                              list[0]
                                                                  .question_standard
                                                          }
                                                      </a>
                                                  </div>
                                              ) : (
                                                  <a>
                                                      没猜到哦！请输入详细信息。
                                                  </a>
                                              )}
                                          </div>
                                      )}

                                  {list.length > 1 && (
                                      <div>
                                          <div>猜你想问：</div>

                                          {list.length > 1 ? (
                                              list.map((data, item) => {
                                                  if (
                                                      item == 0 &&
                                                      sendValue.length < 10
                                                  ) {
                                                      return (
                                                          <div
                                                              key={
                                                                  "comment-list-reply-to-" +
                                                                  item
                                                              }
                                                          >
                                                              <span>
                                                                  {/* {item + "."} */}
                                                              </span>
                                                              <a
                                                                  onClick={() => {
                                                                      this.handleSend(
                                                                          data.question_standard
                                                                      )
                                                                  }}
                                                              >
                                                                  {
                                                                      data.question_standard
                                                                  }
                                                              </a>
                                                          </div>
                                                      )
                                                  }
                                                  if (item != 0)
                                                      return (
                                                          <div
                                                              key={
                                                                  "comment-list-reply-to-" +
                                                                  item
                                                              }
                                                          >
                                                              <span>
                                                                  {/* {item + "."} */}
                                                              </span>
                                                              <a
                                                                  onClick={() => {
                                                                      this.handleSend(
                                                                          data.question_standard
                                                                      )
                                                                  }}
                                                              >
                                                                  {
                                                                      data.question_standard
                                                                  }
                                                              </a>
                                                          </div>
                                                      )
                                              })
                                          ) : (
                                              <a>没猜到哦！请输入详细信息。</a>
                                          )}
                                      </div>
                                  )}
                              </Fragment>
                          ]
                    : null,
            id: this.state.data.length + 1,
            role: "my"
        })

        setTimeout(() => {
            card.scrollTop = card.scrollHeight
        }, 100)
        console.log(this.state.data)
        this.setState({ data: this.state.data, isSpin: false })
    }

    renderFooter() {
        const { sendValue } = this.state
        return (
            <div className={style.footWrapper}>
                <div style={{ width: "100%", display: "flex", height: "42px" }}>
                    <Input
                        value={this.state.sendValue}
                        onChange={e => {
                            this.setState({ sendValue: e.target.value })
                        }}
                        style={{ flex: "1 1 auto" }}
                        placeholder={"请输入消息".toString()}
                        onPressEnter={this.handleSend.bind(this, sendValue)}
                        disabled={this.state.action}
                    ></Input>
                    <div style={{ flex: "0 0 74px", marginLeft: "20px" }}>
                        <Button
                            disabled={this.state.action}
                            type="primary"
                            onClick={this.handleSend.bind(this, sendValue)}
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
                        height: this.props.height ? this.props.height : "100%"
                    }}
                >
                    <Spin
                        tip="回答中。。。"
                        spinning={this.state.isSpin}
                        wrapperClassName={style.Spin}
                    >
                        <div className={style.wrapper}>
                            <Card
                                bordered={null}
                                style={{
                                    margin: "0px",
                                    flex: 1,
                                    // width: "98%",
                                    padding: "0",
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
                            {this.renderFooter()}
                        </div>
                    </Spin>
                </div>
            </Fragment>
        )
    }
}

export default Dialogue
