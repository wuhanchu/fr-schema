import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"

import styles from "@/outter/fr-schema-antd-utils/src/components/Page/DataList.less"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import Modal from "antd/lib/modal/Modal"
import {
    Card,
    message,
    Col,
    Row,
    Button,
    Tooltip,
    AutoComplete,
    Input,
    Dropdown,
    Menu,
} from "antd"
import {
    LikeTwoTone,
    BankTwoTone,
    ThunderboltTwoTone,
    HeartTwoTone,
    DislikeTwoTone,
    TagTwoTone,
    TagsTwoTone,
    FileExcelTwoTone,
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
        const localStorageDomainKey = localStorage.getItem("domain_key")

        super(props, {
            schema: schemas.statistics.schema,
            service: schemas.statistics.service,
            initLocalStorageDomainKey: true,
            infoProps: {
                width: "1200px",
                isCustomize: true,
                customize: {
                    left: 10,
                    right: 14,
                },
            },
            showEdit: false,
            showDelete: false,
            readOnly: true,
            addHide: true,
            // cardProps: { title: "匹配问题详情", bordered: true },
            queryArgs: {
                ...props.queryArgs,
                inside: true,
                domain_key: localStorageDomainKey,
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
            begin_time:
                searchParams.begin_time ||
                tempArgs.begin_time ||
                this.formRef.current.getFieldsValue().begin_time ||
                undefined,
        }
        let data = await this.service.get(params)
        data = this.dataConvert(data)
        return data
    }

    handleFormReset = () => {
        const { order } = this.props

        this.formRef.current.resetFields()
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
                return !item.hideInTable
            })
            console.log(columns)
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
        let res = await clientService.get({ limit: 1000 })
        let client_dict = listToDict(res.list, null, "client_id", "client_name")

        client_dict["null"] = {
            value: "null",
            client_id: "null",
            remark: "未知",
        }
        console.log(client_dict)
        this.schema.client_id.dict = client_dict
        this.meta.queryArgs = {
            ...this.meta.queryArgs,
            // domain_key,
            sort: "desc",
        }
        try {
            // this.formRef.current.setFieldsValue({ domain_key: "default" })
            console.log("设置为default")
            this.formRef.current.setFieldsValue({
                begin_time: moment().subtract("days", 6),
            })
        } catch (error) {}
        let project = await schemas.project.service.get({
            limit: 10000,
            // domain_key: "default",
        })
        this.schema.domain_key.dict = this.props.dict.domain
        this.schema.project_id.dict = listToDict(project.list)
        this.schema.question_standard.render = (item, data) => {
            return (
                <Tooltip title={item}>
                    <div
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "250px",
                        }}
                    >
                        <a
                            onClick={() => {
                                this.setState({ record: data })
                                console.log(data)
                                this.handleVisibleModal(
                                    true,
                                    {
                                        ...data,
                                    },
                                    "edit"
                                )
                            }}
                        >
                            {item}
                        </a>
                    </div>
                </Tooltip>
            )
        }
        super.componentDidMount()
        this.setState({
            searchValues: {
                // domain_key: "default",
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
                        paddingLeft: "24px",
                        paddingRight: "24px",
                        overflow: "hidden",
                        marginBottom: "10px",
                    }}
                >
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                                    总提问
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
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
                                }}
                            >
                                <FileExcelTwoTone
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
                                    总匹配
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
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                                    未匹配问题
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.not_match_total : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div style={{ width: "20px", height: "100%" }}></div>
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                                    总参与评价
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
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                                    解决问题
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
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                                    未解决问题
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
                    <Card
                        style={{ flex: 1 }}
                        bodyStyle={{
                            paddingLeft: "12px",
                            paddingRight: "12px",
                        }}
                        title={false}
                    >
                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    marginTop: "8.5px",
                                    borderRadius: "20px",
                                    background: "#1890ff",
                                    marginRight: "12px",
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
                                    满意度
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
                <Card
                    bordered={false}
                    style={{ width: "100%" }}
                    bodyStyle={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        // paddingBottom: "8px",
                    }}
                >
                    {/* <div className={styles.tableListForm}>{searchBar}</div> */}
                    <div className={styles.tableList}>
                        {/* {this.renderSearchForm && (
                            <div className={styles.tableListForm}>
                                {this.renderSearchForm()}
                            </div>
                        )} */}
                        {operationBar}
                        {this.renderList(
                            {},
                            {
                                renderOpeation: this.renderSummary(),
                                renderToolbar: (
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
                                ),
                            }
                        )}
                    </div>
                </Card>
                {visibleModal && this.renderInfoModal()}
                {visibleImport && this.renderImportModal()}
                {this.renderExtend && this.renderExtend()}
            </>
        )
    }

    async handleQuestionEdit(data, schema) {
        // 更新
        console.log(this.state.record)

        let response
        try {
            response = await schemas.question.service.patch(
                { ...data, domain_key: this.state.record.domain_key },
                schema
            )
            this.refreshList()
            message.success("修改成功")
        } catch (error) {
            message.error(error.message)
        }

        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    renderInfoModal(customProps = {}) {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleModal, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleModal.bind(this),
            handleUpdate: this.handleQuestionEdit.bind(this),
            handleAdd: this.handleAdd.bind(this),
        }

        return (
            visibleModal && (
                <InfoModal
                    renderForm={renderForm}
                    title={"问题详情"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={schemas.question.service}
                    schema={{
                        // id: { title: "编号" },
                        // project_id: {
                        //     ...this.schema.project_id,
                        //     readOnly: true,
                        // },
                        ...schemas.question.schema,
                        group: {
                            ...schemas.question.schema.group,
                            renderInput: (item, data, other) => {
                                return (
                                    <AutoComplete
                                        style={{
                                            width: "100%",
                                            maxWidth: "300px",
                                        }}
                                        disabled={other.disabled}
                                        filterOption={(inputValue, option) =>
                                            option.value
                                                .toUpperCase()
                                                .indexOf(
                                                    inputValue.toUpperCase()
                                                ) !== -1
                                        }
                                        options={this.state.options}
                                    >
                                        {/* {options} */}
                                        <Input placeholder="请输入分组"></Input>
                                    </AutoComplete>
                                )
                            },
                        },
                    }}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }

    handleDomainChange = (item) => {
        if (this.meta.initLocalStorageDomainKey) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: item.key,
            }
            console.log(this.props, this.meta)
            this.refreshList()
        }
    }
    render() {
        const { title, content, tabList, onTabChange } = this.meta
        const { tabActiveKey } = this.state
        const { dict, data } = this.props
        let domain = []
        if (dict) {
            Object.keys(dict.domain).forEach((key) => {
                domain.push(dict.domain[key])
            })
        }
        const menu = (
            <Menu
                onClick={async (item) => {
                    console.log(item)
                    localStorage.setItem("domain_key", item.key)
                    this.setState({
                        localStorageDomainKey: item.key,
                    })
                    this.handleDomainChange(item)
                }}
            >
                {domain &&
                    domain.map((item) => {
                        return (
                            <Menu.Item key={item.key}>
                                <a>{item.name}</a>
                            </Menu.Item>
                        )
                    })}
            </Menu>
        )
        const operations = (
            <Dropdown overlay={menu} placement="bottomLeft">
                <Button style={{ top: "-35px", float: "right" }}>
                    {(this.state.localStorageDomainKey &&
                        dict &&
                        dict.domain[this.state.localStorageDomainKey].name) ||
                        "选择数据域"}
                </Button>
            </Dropdown>
        )
        return (
            <PageHeaderWrapper
                title={false}
                content={
                    content ||
                    (this.renderHeaderContent && this.renderHeaderContent())
                }
                tabList={tabList}
                onTabChange={onTabChange}
                tabActiveKey={tabActiveKey}
                extra={operations}
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
                // domain_key,
                client_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
