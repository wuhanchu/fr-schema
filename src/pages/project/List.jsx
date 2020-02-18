import { Divider, Form, Popconfirm, Modal } from "antd"
import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import QuestionBaseList from "@/pages/question/components/BaseList"

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
            </Fragment>
        )
    }

    renderExtend() {
        return (
            this.state.visibleQuestion && (
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
            )
        )
    }
}

export default List
