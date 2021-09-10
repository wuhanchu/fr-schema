import {
    Divider,
    Modal,
    Row,
    Col,
    Input,
    Card,
    message,
    Dropdown,
    Menu,
} from "antd"
import { connect } from "dva"
import { DownOutlined } from "@ant-design/icons"

import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import QuestionBaseList from "@/pages/question/components/BaseList"
import SearchPageModal from "@/pages/question/components/SearchPageModal"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            operateWidth: 280,
            schema: schemas.project.schema,
            service: schemas.project.service,
            infoProps: {
                width: "900px",
            },
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    handleHideDialogue = () => {
        this.setState({ visibleDialogue: false })
    }

    renderOperateColumnExtend(record) {
        let menus = [
            <Menu.Item key="export">
                <a>标注推送</a>
            </Menu.Item>,

            <Menu.Item key="import">
                <a>标注拉取</a>
            </Menu.Item>,
        ]
        const menu = (
            <Menu
                onClick={async (event) => {
                    switch (event.key) {
                        case "export":
                            this.setState({ record, visibleExport: true })
                            break
                        case "import":
                            this.setState({ record, visibleImport: true })
                            break
                        default:
                            break
                    }
                }}
            >
                {menus}
            </Menu>
        )
        return (
            <Fragment>
                <Divider type="vertical" />

                <a
                    onClick={() =>
                        this.setState({
                            record,
                            visibleQuestion: true,
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
                <Dropdown overlay={menu}>
                    <a href="#">
                        更多 <DownOutlined />
                    </a>
                </Dropdown>
            </Fragment>
        )
    }

    renderExtend() {
        const {
            visibleQuestion,
            record,
            visibleSearch,
            visibleDialogue,
            visibleExport,
            visibleImport,
        } = this.state
        return (
            <Fragment>
                {visibleQuestion && (
                    <Modal
                        width={"95%"}
                        visible={true}
                        footer={null}
                        onCancel={() => {
                            this.setState({
                                visibleQuestion: false,
                            })
                        }}
                    >
                        <QuestionBaseList
                            meta={{
                                queryArgs: {
                                    project_id: "eq." + record.id,
                                },
                                addArgs: { project_id: record.id },
                            }}
                            record={record}
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
                {visibleExport && (
                    <Modal
                        // width={"90%"}
                        visible={true}
                        title={"向标注狗推送"}
                        // footer={null}
                        onOk={async () => {
                            if (!this.state.mark_project_id) {
                                message.error("请输入标注狗项目编号")
                                return
                            }
                            await this.service.export({
                                project_id: this.state.record.id,
                                mark_project_id: parseInt(
                                    this.state.mark_project_id
                                ),
                            })
                            this.setState({
                                visibleExport: false,
                            })
                        }}
                        onCancel={() => {
                            this.setState({
                                visibleExport: false,
                            })
                        }}
                    >
                        <Card bordered={false}>
                            <Row gutter={24}>
                                <Col
                                    lg={7}
                                    style={{
                                        lineHeight: "32px",
                                        textAlign: "right",
                                    }}
                                >
                                    <span
                                        style={{
                                            lineHeight: "32px",
                                            textAlign: "right",
                                        }}
                                    >
                                        标注狗项目编号:
                                    </span>
                                </Col>
                                <Col lg={17}>
                                    <Input
                                        placeholder="请输入标注狗项目编号"
                                        onChange={(e) => {
                                            this.setState({
                                                mark_project_id: e.target.value,
                                            })
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Modal>
                )}
                {visibleImport && (
                    <Modal
                        // width={"90%"}
                        visible={true}
                        title={"从标注狗拉取"}
                        // footer={null}
                        onOk={async () => {
                            if (!this.state.mark_project_id) {
                                message.error("请输入标注狗项目编号")
                                return
                            }
                            await this.service.import({
                                project_id: this.state.record.id,
                                mark_project_id: parseInt(
                                    this.state.mark_project_id
                                ),
                            })
                            this.setState({
                                visibleImport: false,
                            })
                        }}
                        onCancel={() => {
                            this.setState({
                                visibleImport: false,
                            })
                        }}
                    >
                        <Card bordered={false}>
                            <Row gutter={24}>
                                <Col
                                    lg={7}
                                    style={{
                                        lineHeight: "32px",
                                        textAlign: "right",
                                    }}
                                >
                                    <span
                                        style={{
                                            lineHeight: "32px",
                                            textAlign: "right",
                                        }}
                                    >
                                        标注狗项目编号:
                                    </span>
                                </Col>
                                <Col lg={17}>
                                    <Input
                                        placeholder="请输入标注狗项目编号"
                                        onChange={(e) => {
                                            this.setState({
                                                mark_project_id: e.target.value,
                                            })
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Modal>
                )}
            </Fragment>
        )
    }

    renderSearchBar() {
        const { name, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
