import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import Modal from "antd/lib/modal/Modal"
import { Radio, List, Tag } from "antd"
import { formatData } from "@/utils/utils"
import projectService from "@/schemas/project"
import { listToDict } from "@/outter/fr-schema/src/dict"

const { utils } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class MyList extends DataList {
    constructor(props) {
        console.log(props)
        super(props, {
            schema: schemas.searchHistory.schema,
            service: schemas.searchHistory.service,
            // mini: true,
            infoProps: {
                width: "900px",
            },
            operateWidth: "100px",

            showEdit: false,
            showDelete: false,
            // readOnly: true,
            addHide: true,
            queryArgs: {
                ...props.queryArgs,
                domain_key: props.record.key,
                limit: 10,
            },
        })
    }

    async componentDidMount() {
        let res = await projectService.service.get({ limit: 1000 })
        super.componentDidMount()
        const onChange = (e, data) => {
            this.setState({ listLoading: true })
            this.handleUpdate({
                user_confirm: true,
                ...data,
                match: e.target.value,
            })
        }
        console.log("dict", this.props.dict)
        this.schema.match_project_id.dict = listToDict(res.list)
        this.schema.match.render = (item, data) => {
            return (
                <>
                    <Radio.Group
                        onChange={(e) => {
                            onChange(e, data)
                        }}
                        value={data.match}
                    >
                        <Radio value={true}>匹配</Radio>
                        <Radio value={false}>不匹配</Radio>
                    </Radio.Group>
                </>
            )
        }
    }
    renderOperateColumnExtend(record) {
        return (
            <>
                <a
                    onClick={() => {
                        this.setState({ record, showAnswer: true })
                    }}
                >
                    匹配列表
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
                        title="匹配列表"
                        footer={false}
                        width={900}
                        onCancel={() => {
                            this.setState({
                                showAnswer: false,
                            })
                        }}
                        visible={true}
                    >
                        <List
                            size="large"
                            style={{ maxHeight: "60vh", overflowY: "auto" }}
                            bordered
                            dataSource={record.return_question || []}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <a key="list-loadmore-more">
                                            {formatData(item.compatibility, 5)}
                                        </a>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div>
                                                {item.question}
                                                {record.match_question_id ===
                                                item.id ? (
                                                    <Tag color="#108ee9">
                                                        已匹配问题
                                                    </Tag>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        }
                                        description={
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        item.answer &&
                                                        item.answer
                                                            .trim()
                                                            .replace(
                                                                /<b>/g,
                                                                "<b style='color:red;'>"
                                                            )
                                                            .replace(
                                                                /\n/g,
                                                                "<br/>"
                                                            ),
                                                }}
                                            />
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Modal>
                )}
            </>
        )
    }

    renderSearchBar() {
        const { search, match } = this.schema

        const filters = this.createFilters(
            {
                search,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default MyList
