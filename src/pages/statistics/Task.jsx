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
    DownOutlined,
} from "@ant-design/icons"
import {
    Axis,
    Chart,
    Tooltip as ChartTooltip,
    Interval,
    View,
    Line,
    Legend,
    getTheme,
} from "bizcharts"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { formatData } from "@/utils/utils"
import clientService from "@/pages/authority/clientList/service"
import moment from "moment"
import SearchHistory from "@/pages/domain/component/SearchHistory"

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
        this.schema.client_id.dict = client_dict
        this.meta.queryArgs = {
            ...this.meta.queryArgs,
            sort: "desc",
        }
        try {
            this.formRef.current.setFieldsValue({
                begin_time: moment().subtract("days", 6),
            })
        } catch (error) {}
        let project = await schemas.project.service.get({
            limit: 10000,
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
        const theme = getTheme()

        const data = [
            { name: "London", month: "Jan.", monthAverageRain: 18.9 },
            { name: "London", month: "Feb.", monthAverageRain: 28.8 },
            { name: "London", month: "Mar.", monthAverageRain: 39.3 },
            { name: "London", month: "Apr.", monthAverageRain: 81.4 },
            { name: "London", month: "May", monthAverageRain: 47 },
            { name: "London", month: "Jun.", monthAverageRain: 20.3 },
            { name: "London", month: "Jul.", monthAverageRain: 24 },
            { name: "London", month: "Aug.", monthAverageRain: 35.6 },
            { name: "Berlin", month: "Jan.", monthAverageRain: 12.4 },
            { name: "Berlin", month: "Feb.", monthAverageRain: 23.2 },
            { name: "Berlin", month: "Mar.", monthAverageRain: 34.5 },
            { name: "Berlin", month: "Apr.", monthAverageRain: 99.7 },
            { name: "Berlin", month: "May", monthAverageRain: 52.6 },
            { name: "Berlin", month: "Jun.", monthAverageRain: 35.5 },
            { name: "Berlin", month: "Jul.", monthAverageRain: 37.4 },
            { name: "Berlin", month: "Aug.", monthAverageRain: 42.4 },
        ]
        const average = data.reduce((pre, item) => {
            const { month, monthAverageRain } = item
            if (!pre[month]) {
                pre[month] = 0
            }
            pre[month] += monthAverageRain
            return pre
        }, {})

        const averageData = Object.keys(average).map((key) => {
            return {
                month: key,
                averageRain: Number((average[key] / 2).toFixed(2)),
                name: "avg",
            }
        })

        const scale = {
            month: {
                sync: true,
            },
            averageRain: {
                min: 0,
                max: 100,
                alias: "接通率",
            },
            monthAverageRain: {
                min: 0,
                max: 100,
            },
        }

        const colors = theme.colors10
        /**
         * 图例开关状态
         */
        let legendMap = {}
        /**
         * 图表实例
         */
        let chartIns
        const { summary } = this.state.data
        return (
            <Chart
                height={400}
                padding={[50, 60]}
                scale={scale}
                data={data}
                autoFit
                onGetG2Instance={(c) => (chartIns = c)}
            >
                <ChartTooltip shared />
                <Interval
                    adjust={[
                        {
                            type: "dodge",
                            marginRatio: 0,
                        },
                    ]}
                    color={["name", colors]}
                    position="month*monthAverageRain"
                />
                <Axis name="monthAverageRain" position="left" />
                <View data={averageData} scale={scale} padding={0}>
                    <Axis name="averageRain" position="right" />
                    <Line position="month*averageRain" color={colors[2]} />
                </View>
                <Legend
                    custom={true}
                    items={[
                        {
                            name: "London",
                            value: "London",
                            marker: {
                                symbol: "square",
                                style: { fill: colors[0] },
                            },
                        },
                        {
                            name: "Berlin",
                            value: "Berlin",
                            marker: {
                                symbol: "square",
                                style: { fill: colors[1] },
                            },
                        },
                        {
                            name: "平均",
                            value: "avg",
                            marker: {
                                symbol: "hyphen",
                                style: { stroke: colors[2], lineWidth: 2 },
                            },
                        },
                    ]}
                    onChange={(ev) => {
                        const { item } = ev
                        const { value } = item
                        const checked = !item.unchecked
                        // 设置图例项状态
                        legendMap[value] = checked
                        if (value === "avg") {
                            // 通过filter控制元素显示隐藏
                            const view = chartIns.views[0]
                            view.filter("name", (val) => {
                                return legendMap[val]
                            })
                            // 重新渲染，触发filter
                            view.render(true)
                        } else {
                            // 通过filter控制元素显示隐藏
                            chartIns.filter("name", (val) => {
                                return legendMap[val] !== false
                            })
                            // 重新渲染，触发filter
                            chartIns.render(true)
                        }
                    }}
                />
            </Chart>
        )
    }

    renderDataList() {
        const { visibleModal, visibleImport } = this.state
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
                    <div className={styles.tableList}>
                        {operationBar}
                        {this.renderList(
                            { tableRender: () => <></> },
                            {
                                renderOpeation: this.renderSummary(),
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
                    <DownOutlined />
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
        const {
            showAnswer,
            record,
            showSearchHistory,
            initLocalStorageDomainKey,
        } = this.state
        if (this.formRef && this.formRef.current)
            console.log(this.formRef.current.getFieldsValue())
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
                {showSearchHistory && (
                    <Modal
                        title={"提问历史"}
                        width={"90%"}
                        visible={showSearchHistory}
                        footer={null}
                        onCancel={() => {
                            this.setState({ showSearchHistory: false })
                        }}
                    >
                        <SearchHistory
                            searchArgs={{
                                ...(this.formRef &&
                                    this.formRef.current &&
                                    this.formRef.current.getFieldsValue()),
                                match_project_id: "notHave",
                            }}
                            record={{ key: this.meta.queryArgs.domain_key }}
                        ></SearchHistory>
                    </Modal>
                )}
            </>
        )
    }
}

export default List
