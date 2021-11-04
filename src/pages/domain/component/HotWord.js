import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import Modal from "antd/lib/modal/Modal"
import { Card, message } from "antd"

const { utils } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.hotWord.schema,
            service: schemas.hotWord.service,
            infoProps: {
                width: "900px",
            },
            showEdit: false,
            showDelete: false,
            // readOnly: true,
            addHide: true,
        })
    }

    async componentDidMount() {
        let { location } = this.props
        if (location && !location.query.domain_key) {
            message.error("缺少domain_key参数")
            this.setState({ listLoading: false })
            return
        }
        let domain_key = this.props.domain_key || location.query.domain_key
        // this.meta.mini = !location
        this.meta.queryArgs = {
            ...this.meta.queryArgs,
            domain_key,
            sort: "desc",
        }
        let project = await schemas.project.service.get({
            limit: 10000,
            domain_key,
        })
        this.schema.project_id.dict = listToDict(project.list)
        super.componentDidMount()
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <a
                    onClick={() => {
                        this.setState({
                            record,
                            showAnswer: true,
                        })
                    }}
                >
                    查看答案
                </a>
            </>
        )
    }

    renderExtend() {
        const { showAnswer, record } = this.state
        return (
            <>
                {showAnswer && (
                    <Modal
                        title="答案"
                        footer={false}
                        // centered
                        onCancel={() => {
                            this.setState({
                                showAnswer: false,
                            })
                        }}
                        visible={true}
                    >
                        <Card bordered={false}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html:
                                        record.answer &&
                                        record.answer
                                            .replace(
                                                /<b>/g,
                                                "<b style='color:red;'>"
                                            )
                                            .replace(/\n/g, "<br/>"),
                                }}
                            />
                        </Card>
                    </Modal>
                )}
            </>
        )
    }

    renderSearchBar() {
        const { begin_time, end_time, project_id } = this.schema
        const filters = this.createFilters(
            {
                begin_time,
                end_time,
                project_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
