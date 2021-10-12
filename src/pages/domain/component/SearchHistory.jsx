import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import Modal from "antd/lib/modal/Modal"
import { Checkbox, Button, Table, Space, Card, message, DatePicker } from "antd"
import { formatData } from "@/utils/utils"
import projectService from "@/schemas/project"
import { listToDict } from "@/outter/fr-schema/src/dict"

const { RangePicker } = DatePicker
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
        this.setState({ projectDict: listToDict(res.list) })
        this.schema.match_project_id.dict = listToDict(res.list)
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <a
                    onClick={() => {
                        this.setState({
                            record,
                            showAnswer: true,
                            matchQuestion: {
                                id: record.match_question_id,
                                question: record.match_question_txt,
                                project_id: record.match_project_id,
                            },
                        })
                    }}
                >
                    查询结果
                </a>
            </>
        )
    }

    renderExtend() {
        const { showAnswer, record, projectDict } = this.state

        const columns = [
            {
                title: "问题库",
                dataIndex: "project_id",
                key: "project_id",
                render: (project_id) => <>{projectDict[project_id].name}</>,
            },
            {
                title: "标准问",
                dataIndex: "question",
                key: "question",
            },
            {
                title: "匹配率",
                dataIndex: "compatibility",
                key: "compatibility",
                render: (compatibility) => <>{formatData(compatibility, 5)}</>,
            },
            {
                title: "是否正确返回",
                key: "action",
                render: (text, record) => (
                    <Space size="middle">
                        <Checkbox
                            checked={
                                (this.state.matchQuestion &&
                                    this.state.matchQuestion.id) === record.id
                            }
                            onChange={(e) => {
                                this.setState({
                                    matchQuestion: e.target.checked
                                        ? record
                                        : null,
                                })
                            }}
                        />
                    </Space>
                ),
            },
        ]

        return (
            <>
                {showAnswer && (
                    <Modal
                        title="查询结果"
                        footer={false}
                        width={1100}
                        onCancel={() => {
                            this.setState({
                                showAnswer: false,
                            })
                        }}
                        visible={true}
                    >
                        <Card bordered={false}>
                            <Table
                                style={{ marginBottom: "24px" }}
                                bordered
                                pagination={false}
                                size={"middle"}
                                columns={columns}
                                dataSource={record.return_question}
                            />
                            <Button
                                type="primary"
                                style={{
                                    float: "right",
                                    right: "24px",
                                    botton: "24px",
                                    position: "absolute",
                                }}
                                onClick={async () => {
                                    try {
                                        await this.service.patch({
                                            return_question: this.state
                                                .matchQuestion,
                                            id: record.id,
                                        })
                                        message.success("确认成功！")
                                        this.setState({ showAnswer: false })
                                        this.refreshList()
                                    } catch (e) {
                                        message.error(e.message)
                                    }
                                }}
                            >
                                确认
                            </Button>
                        </Card>
                    </Modal>
                )}
            </>
        )
    }

    renderSearchBar() {
        const { search, create_time, user_confirm } = this.schema

        const filters = this.createFilters(
            {
                create_time: {
                    ...create_time,
                    style: { width: "100%" },
                    renderInput: () => {
                        return <RangePicker />
                    },
                },
                search,
                user_confirm: {
                    ...user_confirm,
                    dict: {
                        true: {
                            value: "true",
                            remark: "是",
                        },
                        false: {
                            value: "false",
                            remark: "否",
                        },
                    },
                },
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default MyList
