import {
    Divider,
    Form,
    Popconfirm,
    Modal,
    Avatar,
    Row,
    Col,
    Input,
    Button
} from "antd"
import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import QuestionBaseList from "@/pages/question/components/BaseList"
import SearchPageModal from "@/pages/question/components/SearchPageModal"

import Dialogue from "./Dialogue"
@connect(({ global }) => ({
    dict: global.dict
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            operateWidth: 250,
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
            </Fragment>
        )
    }

    renderExtend() {
        const {
            visibleQuestion,
            record,
            visibleSearch,
            visibleDialogue
        } = this.state
        return (
            <Fragment>
                {visibleQuestion && (
                    <Modal
                        width={"90%"}
                        visible={true}
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
                    <Dialogue
                        record={record}
                        visibleDialogue={visibleDialogue}
                        handleHideDialogue={this.handleHideDialogue}
                    ></Dialogue>
                )}
            </Fragment>
        )
    }
}

export default List
