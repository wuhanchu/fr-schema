import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import styles from "@/outter/fr-schema-antd-utils/src/components/Page/DataList.less"
import { PageHeaderWrapper } from "@ant-design/pro-layout"

import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import Modal from "antd/lib/modal/Modal"
import { Card, message, Col, Row, Button } from "antd"
import {
    LikeTwoTone,
    BankTwoTone,
    ThunderboltTwoTone,
    HeartTwoTone,
    DislikeTwoTone,
    TagTwoTone,
    TagsTwoTone,
} from "@ant-design/icons"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { formatData } from "@/utils/utils"
import clientService from "@/pages/authority/clientList/service"
import moment from "moment"
const { utils, decorateList } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.statistics.schema,
            service: schemas.statistics.service,
            infoProps: {
                width: "900px",
            },
            showEdit: false,
            showDelete: false,
            readOnly: true,
            addHide: true,
            queryArgs: {
                ...props.queryArgs,
                inside: true,
            },
        })
    }

    async requestList(tempArgs = {}) {
        const { queryArgs } = this.meta

        let searchParams = this.getSearchParam()

        const params = {
            ...(queryArgs || {}),
            ...searchParams,
            ...(this.state.pagination || {}),
            ...tempArgs,
            domain_key:
                tempArgs.domain_key ||
                searchParams.domain_key ||
                this.formRef.current.getFieldsValue().domain_key,
            begin_time:
                searchParams.begin_time ||
                tempArgs.begin_time ||
                this.formRef.current.getFieldsValue().begin_time ||
                undefined,
            // begin_time: undefined
        }
        // console.log(this.searchValues())
        let data = await this.service.get(params)
        data = this.dataConvert(data)
        return data
    }

    handleFormReset = () => {
        const { order } = this.props

        this.formRef.current.resetFields()
        this.formRef.current.setFieldsValue({ domain_key: "default" })
        this.formRef.current.setFieldsValue({
            begin_time: moment().subtract("days", 6),
        })

        this.setState(
            {
                pagination: { ...this.state.pagination, currentPage: 1 },
                searchValues: { order },
            },
            () => {
                this.refreshList({
                    domain_key: "default",
                    begin_time: moment().subtract("days", 6),
                })
            }
        )
    }

    async handleExport(args, schema) {
        this.setState({ exportLoading: true }, async () => {
            let column = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "external_id"
            })
            let columns = column
            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
                logical_path: undefined,
            })
            const list =
                data &&
                data.list.map((item, index) => {
                    return {
                        ...item,
                        config: JSON.stringify(item.config),
                        intent_key:
                            item.intent_key && item.intent_key.join("|"),
                    }
                })
            data = decorateList(list, this.schema)
            await exportData("统计详情", data, columns)
            this.setState({ exportLoading: false })
        })
        // this.handleVisibleExportModal()
    }
    async componentDidMount() {
        // let domain_key = "fsfund"
        // this.meta.mini = !location

        let res = await clientService.get({ limit: 1000 })
        let client_dict = listToDict(res.list, null, "client_id", "client_name")

        client_dict["null"] = {
            value: "null",
            remark: "未知",
        }
        this.schema.client_id.dict = client_dict
        this.meta.queryArgs = {
            ...this.meta.queryArgs,
            // domain_key,
            sort: "desc",
        }
        try {
            this.formRef.current.setFieldsValue({ domain_key: "default" })
            this.formRef.current.setFieldsValue({
                begin_time: moment().subtract("days", 6),
            })
        } catch (error) {}
        let project = await schemas.project.service.get({
            limit: 10000,
            domain_key,
        })
        this.schema.domain_key.dict = this.props.dict.domain
        this.schema.project_id.dict = listToDict(project.list)
        super.componentDidMount()
        this.setState({
            searchValues: {
                domain_key: "default",
                begin_time: moment().subtract("days", 6),
            },
        })
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

    renderSummary() {
        const { summary } = this.state.data
        return (
            <div className="site-card-wrapper">
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        marginTop: "20px",
                        marginBottom: "10px",
                    }}
                >
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <BankTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    总提问数
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.total : 0}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <TagsTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    总匹配数
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.match_total : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <TagTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    总匹配率
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary
                                        ? formatData(
                                              summary.match_rate || 0,
                                              // 0.8461538461538461,
                                              4,
                                              100
                                          ) + "%"
                                        : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <ThunderboltTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    总参与评价数
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.mark_total : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <LikeTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    解决问题数
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.mark_right_num : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <DislikeTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    未解决问题数
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.mark_error_num : 0}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card style={{ flex: 1 }} title={false}>
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "24px",
                                }}
                            >
                                <HeartTwoTone
                                    twoToneColor="#fff"
                                    style={{
                                        fontSize: "20px",
                                        marginTop: "8px",
                                        marginLeft: "8px",
                                    }}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        color: "#00000073",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    满意度占比
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary
                                        ? formatData(
                                              summary.satisfaction || 0,
                                              // 0.8461538461538461,
                                              4,
                                              100
                                          ) + "%"
                                        : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    renderDataList() {
        const { visibleModal, visibleImport } = this.state
        console.log(this.state)
        let {
            renderOperationBar,
            renderSearchBar,
            renderOperateColumn,
        } = this.props

        // 操作栏
        let operationBar = null
        operationBar = this.renderOperationBar && this.renderOperationBar()
        if (renderOperationBar) {
            operationBar = renderOperationBar()
        }

        // 搜索栏
        let searchBar = null
        if (renderSearchBar) {
            searchBar = renderSearchBar()
        } else if (renderSearchBar !== null) {
            searchBar = this.renderSearchBar && this.renderSearchBar()
        }

        return (
            <>
                <Card bordered={false} style={{ width: "100%" }}>
                    <div className={styles.tableListForm}>{searchBar}</div>
                    <div className={styles.tableList}>
                        {this.renderSearchForm && (
                            <div className={styles.tableListForm}>
                                {this.renderSearchForm()}
                            </div>
                        )}
                        {operationBar}
                        <div>
                            匹配问题总览
                            <Button
                                loading={this.state.exportLoading}
                                style={{ float: "right" }}
                                onClick={() => {
                                    // this.setState({ visibleExport: true })
                                    this.handleExport({}, {})
                                }}
                            >
                                导出
                            </Button>
                        </div>
                        {this.renderSummary()}
                        <div style={{ marginBottom: "10px" }}>匹配问题详情</div>

                        {this.renderList()}
                    </div>
                </Card>
                {visibleModal && this.renderInfoModal()}
                {visibleImport && this.renderImportModal()}
                {this.renderExtend && this.renderExtend()}
            </>
        )
    }
    render() {
        const { title, content, tabList, onTabChange } = this.meta
        const { tabActiveKey } = this.state

        return (
            <PageHeaderWrapper
                title={title && title + "列表"}
                content={
                    content ||
                    (this.renderHeaderContent && this.renderHeaderContent())
                }
                tabList={tabList}
                onTabChange={onTabChange}
                tabActiveKey={tabActiveKey}
            >
                {this.renderDataList()}
            </PageHeaderWrapper>
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
                                    __html: record.answer && record.answer,
                                }}
                            />
                        </Card>
                    </Modal>
                )}
            </>
        )
    }

    renderSearchBar() {
        const { begin_time, end_time, domain_key, client_id } = this.schema
        const filters = this.createFilters(
            {
                begin_time,
                end_time,
                domain_key,
                client_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
