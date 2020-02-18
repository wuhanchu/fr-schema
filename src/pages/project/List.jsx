import { Divider, Form, Popconfirm, Modal } from "antd"
import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import QuestionBaseList from "@/pages/question/components/BaseList"
import SearchPageModal from "@/pages/question/components/SearchPageModal"

@connect(({ global }) => ({
    dict: global.dict
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            operateWidth: 200,
            schema: schemas.project.schema,
            service: schemas.project.service
        })
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
            </Fragment>
        )
    }

    renderExtend() {
        return (
            <Fragment>
                {this.state.visibleQuestion && (
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
                                    project_id: "eq." + this.state.record.id
                                },
                                addArgs: { project_id: this.state.record.id }
                            }}
                        />
                    </Modal>
                )}
                {this.state.visibleSearch && (
                    <SearchPageModal
                        onCancel={() => {
                            this.setState({ visibleSearch: false })
                        }}
                        title={this.state.record.name + "知识搜索"}
                        record={this.state.record}
                    />
                )}
            </Fragment>
        )
    }
}

export default List
