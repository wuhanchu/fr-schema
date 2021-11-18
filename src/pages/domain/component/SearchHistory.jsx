import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import Modal from "antd/lib/modal/Modal"
import {
    Checkbox,
    Button,
    Table,
    Space,
    Card,
    message,
    DatePicker,
    Popconfirm,
    Tag,
} from "antd"
import { formatData } from "@/utils/utils"
import projectService from "@/schemas/project"
import SearchPageModal from "@/pages/question/components/SearchPageModal"
import { listToDict } from "@/outter/fr-schema/src/dict"
import { CheckOutlined } from "@ant-design/icons"
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
            infoProps: {
                width: "900px",
            },
            operateWidth: "100px",

            showEdit: false,
            showDelete: false,
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
                    处理
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

        let data =
            record &&
            record.return_question &&
            record.return_question.map((item) => {
                return { ...item, question_standard: item.question }
            })
        // this.setState({dataList: data})
        return (
            <>
                {showAnswer && (
                    <SearchPageModal
                        type={"history"}
                        onCancel={() => {
                            this.setState({ showAnswer: false })
                        }}
                        title={"处理" + "(" + record.search + ")"}
                        record={record}
                        data={data}
                        refreshList={this.refreshList.bind(this)}
                        renderOperationButton={(data) => {
                            return (
                                <>
                                    <Popconfirm
                                        title="是否重置当前匹配的问题？"
                                        onConfirm={async (e) => {
                                            await this.service.patch(
                                                {
                                                    id: record.id,
                                                },
                                                false
                                            )
                                            this.setState({
                                                record: {
                                                    ...record,
                                                    match_question_id: null,
                                                },
                                            })
                                            message.success("操作成功！")
                                            this.refreshList()
                                            e.stopPropagation()
                                        }}
                                    >
                                        <Button style={{ marginLeft: "5px" }}>
                                            重置匹配
                                        </Button>
                                    </Popconfirm>
                                </>
                            )
                        }}
                        renderTitleOpeation={(data) => {
                            return (
                                <>
                                    {data.id === record.match_question_id ? (
                                        <Tag
                                            style={{
                                                marginLeft: "3px",
                                                marginRight: "3px",
                                            }}
                                            // style={{ marginLeft: "3px" }}
                                            color="#87d068"
                                        >
                                            {"匹配"}
                                        </Tag>
                                    ) : (
                                        <Popconfirm
                                            title="是否确认标记此数据为正确匹配？"
                                            onConfirm={async (e) => {
                                                await this.service.patch({
                                                    return_question: data,
                                                    id: record.id,
                                                })
                                                message.success("确认成功！")
                                                this.setState({
                                                    showAnswer: false,
                                                })
                                                this.refreshList()
                                                e.stopPropagation()
                                            }}
                                        >
                                            <a
                                                style={{
                                                    marginLeft: "10px",
                                                    marginRight: "10px",
                                                }}
                                            >
                                                确认
                                            </a>
                                        </Popconfirm>
                                    )}
                                </>
                            )
                        }}
                    />
                )}
            </>
        )
    }

    renderSearchBar() {
        const {
            search,
            create_time,
            user_confirm,
            have_match_project_id,
            task_id,
        } = this.schema

        const filters = this.createFilters(
            {
                create_time: {
                    ...create_time,
                    style: { width: "100%" },
                    renderInput: () => {
                        return <RangePicker showTime />
                    },
                },
                search,
                user_confirm: {
                    ...user_confirm,
                    dict: {
                        true: {
                            value: "true",
                            remark: "已解决",
                        },
                        false: {
                            value: "false",
                            remark: "未解决",
                        },
                        null: {
                            value: "null",
                            remark: "未评价",
                        },
                    },
                },
                have_match_project_id,
                task_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default MyList
