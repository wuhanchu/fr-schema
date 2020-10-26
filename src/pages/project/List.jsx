import {
    Divider,
    Popconfirm,
    Modal,
    Avatar,
    Row,
    Col,
    Input,
    Button,
    Card,
    message
} from "antd"
import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import QuestionBaseList from "@/pages/question/components/BaseList"
import SearchPageModal from "@/pages/question/components/SearchPageModal"
import DialogueModal from "@/pages/question/components/DialogueModal"

@connect(({ global }) => ({
    dict: global.dict
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            operateWidth: 300,
            schema: schemas.project.schema,
            service: schemas.project.service
        })
    }

    handleHideDialogue = () => {
        this.setState({ visibleDialogue: false })
        console.log("cuole")
    }

    renderOperateColumnExtend(record) {
        return (
            <Fragment>
                <Divider type="vertical" />

                <a
                    onClick={() =>
                        this.setState({
                            record,
                            visibleQuestion: true
                        })
                    }
                >
                    问题集
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleSearch: true })
                    }}
                >
                    搜索
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleDialogue: true })
                    }}
                >
                    对话
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleExport: true })
                    }}
                >
                    导出
                </a>
            </Fragment>
        )
    }

    renderExtend() {
        const {
            visibleQuestion,
            record,
            visibleSearch,
            visibleDialogue,
            visibleExport
        } = this.state
        return (
            <Fragment>
                {visibleQuestion && (
                    <Modal
                        width={"90%"}
                        visible={true}
                        footer={null}
                        onCancel={() => {
                            this.setState({
                                visibleQuestion: false
                            })
                        }}
                    >
                        <QuestionBaseList
                            meta={{
                                queryArgs: {
                                    project_id: "eq." + record.id
                                },
                                addArgs: { project_id: record.id }
                            }}
                        />
                    </Modal>
                )}
                {visibleSearch && (
                    <SearchPageModal
                        onCancel={() => {
                            this.setState({ visibleSearch: false })
                        }}
                        title={record.name + "知识搜索"}
                        record={record}
                    />
                )}
                {visibleDialogue && (
                    <DialogueModal
                        record={record}
                        visibleDialogue={visibleDialogue}
                        handleHideDialogue={this.handleHideDialogue}
                    ></DialogueModal>
                )}
                {visibleExport && (
                    <Modal
                        // width={"90%"}
                        visible={true}
                        title={"导出"}
                        // footer={null}
                        onOk={async () => {
                            if (!this.state.mark_project_id) {
                                message.error("请输入标注狗项目ID")
                                return
                            }
                            await this.service.export({
                                project_id: this.state.record.id,
                                mark_project_id: parseInt(
                                    this.state.mark_project_id
                                )
                            })
                            this.setState({
                                visibleExport: false
                            })
                        }}
                        onCancel={() => {
                            this.setState({
                                visibleExport: false
                            })
                        }}
                    >
                        <Card bordered={false}>
                            <Row gutter={24}>
                                <Col
                                    lg={6}
                                    style={{
                                        lineHeight: "32px",
                                        textAlign: "right"
                                    }}
                                >
                                    <span
                                        style={{
                                            lineHeight: "32px",
                                            textAlign: "right"
                                        }}
                                    >
                                        标注狗项目id
                                    </span>
                                </Col>
                                <Col lg={18}>
                                    <Input
                                        onChange={e => {
                                            this.setState({
                                                mark_project_id: e.target.value
                                            })
                                        }}
                                    ></Input>
                                </Col>
                            </Row>
                        </Card>
                    </Modal>
                )}
            </Fragment>
        )
    }
}

export default List
