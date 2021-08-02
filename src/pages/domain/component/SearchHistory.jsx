import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import Modal from "antd/lib/modal/Modal"
import { Card, Radio } from "antd"

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        console.log(props)
        super(props, {
            schema: schemas.searchHistory.schema,
            service: schemas.searchHistory.service,
            // mini: true,
            infoProps: {
                width: "900px",
            },
            showEdit: false,
            showDelete: false,
            // readOnly: true,
            addHide: true,
            queryArgs: {
                ...props.queryArgs,
                domain_key: props.record.key,
                limit: 10,
                // match_question_txt: 'not.is.null'
            },
        })
    }

    async componentDidMount() {
        super.componentDidMount()
    }
    renderOperateColumnExtend(record) {
        const onChange = (e) => {
            console.log("radio checked", e.target.value)
            // setValue(e.target.value);
            this.setState({ listLoading: true })
            this.handleUpdate({ user_confirm: e.target.value, id: record.id })
        }

        return (
            <>
                <Radio.Group onChange={onChange} value={record.user_confirm}>
                    <Radio value={true}>对</Radio>
                    <Radio value={false}>错</Radio>
                </Radio.Group>
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
        const { search, user_confirm } = this.schema

        const filters = this.createFilters(
            {
                search,
                user_confirm,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
