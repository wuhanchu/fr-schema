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
import userService from "@/pages/authority/user/service"
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
    Divider,
    Menu,
    Tree,
    Tabs,
    Table,
    Spin,
    Empty,
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
import schema from "@/schemas/statistics/task"
import TabList from "@/pages/tabList/TabList"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { formatData } from "@/utils/utils"
import clientService from "@/pages/authority/clientList/service"
import moment from "moment"
import SearchHistory from "@/pages/domain/component/SearchHistory"
import { flow } from "lodash"

const { utils, decorateList } = frSchema
const { TabPane } = Tabs
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends TabList {
    constructor(props) {
        const localStorageDomainKey = localStorage.getItem("domain_key")

        super(props, {
            schema: schema.schema,
            service: schema.service,
            initLocalStorageDomainKey: true,
            infoProps: {
                width: "1200px",
                isCustomize: true,
                customize: {
                    left: 10,
                    right: 14,
                },
            },
            search: {
                span: 6,
            },
            showEdit: false,
            showDelete: false,
            readOnly: true,
            addHide: true,
            // cardProps: { title: "匹配问题详情", bordered: true },
            queryArgs: {
                ...props.queryArgs,
                // inside: true,
                limit: 1000,
                order: "create_date.desc",
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
            begin_time: moment().subtract("days", 14),
        })

        this.setState(
            {
                pagination: { ...this.state.pagination, currentPage: 1 },
                searchValues: { order },
            },
            () => {
                this.refreshList({
                    // domain_key: "default",
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

    init = async () => {
        let res = await clientService.get({ limit: 1000 })
        let client_dict = listToDict(res.list, null, "client_id", "client_name")

        client_dict["null"] = {
            value: "null",
            client_id: "null",
            remark: "未知",
        }
        this.schema.client_id.dict = client_dict

        let flow = await schemas.flow.service.get({
            limit: 1000,
            select: "id, key, domain_key, name",
            domain_key: this.meta.queryArgs.domain_key,
        })
        this.schema.flow_key.dict = listToDict(flow.list, "", "key", "name")
        let task = await schemas.outboundTask.service.get({
            limit: 1000,
            domain_key: this.meta.queryArgs.domain_key,
        })
        this.schema.task_id.dict = listToDict(task.list, "", "id", "name")

        await this.findUserList()
    }

    async componentDidMount() {
        try {
            this.formRef.current.setFieldsValue({
                begin_time: moment().subtract("days", 14),
            })
        } catch (error) {}
        super.componentDidMount()
        this.setState({
            searchValues: {
                begin_time: moment().subtract("days", 14),
            },
        })
        this.init()
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
    async findUserList() {
        let res = await userService.get({ pageSize: 10000, select: "id, name" })
        this.schema.user_id.dict = listToDict(res.list, null, "id", "name")
    }

    renderSummary() {
        const theme = getTheme()
        let data = []
        let averageData = []
        let max = 0
        this.state.data.list.map((item, index) => {
            data.push({
                name: "接通",
                month: item.create_date,
                monthAverageRain: item.normal,
                ...item,
            })
            data.push({
                name: "未接通",
                month: item.create_date,
                monthAverageRain: item.abnormal,
                ...item,
            })
            if (item.normal > item.abnormal) {
                if (item.normal > max) {
                    max = item.normal
                }
            } else {
                if (item.abnormal > max) {
                    max = item.abnormal
                }
            }

            averageData.push({
                month: item.create_date,
                averageRain: item.connected_rate * 100,
                data: "ces",
                name: "avg",
            })
            return
        })

        console.log(max % 4)

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
                max: max + (max % 4),
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
                <ChartTooltip shared>
                    {(title, items) => {
                        console.log(items)
                        let one = this.state.data.list.filter((item) => {
                            return item.create_date == items[0].title
                        })[0]
                        return (
                            <div>
                                <div style={{ margin: "12px" }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        接通率：
                                        {Math.round(
                                            one.connected_rate * 100 * 10 ** 2
                                        ) /
                                            10 ** 2}
                                        %
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        接通：
                                        {one.normal}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        未接通：
                                        {one.abnormal}
                                    </div>
                                    <Divider
                                        style={{ margin: "8px 0px 8px 0px " }}
                                    />
                                    <div style={{ marginBottom: "8px" }}>
                                        未接通：
                                        {one.no_connect}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        拒接：
                                        {one.refuse}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        无应答：
                                        {one.no_answer}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        拨打失败：
                                        {one.failed}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        忙线：
                                        {one.busy}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        空号：
                                        {one.empty}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        关机：
                                        {one.shutdown}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        停机：
                                        {one.halt}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                        其他：
                                        {one.other}
                                    </div>
                                </div>
                            </div>
                        )
                    }}
                </ChartTooltip>
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
                            name: "接通",
                            value: "接通",
                            marker: {
                                symbol: "square",
                                style: { fill: colors[0] },
                            },
                        },
                        {
                            name: "未接通",
                            value: "未接通",
                            marker: {
                                symbol: "square",
                                style: { fill: colors[1] },
                            },
                        },
                        {
                            name: "接通率",
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

    handleRenderTable = () => {
        let columns = []
        Object.keys(this.schema).forEach((key) => {
            if (!this.schema[key].hideInTable)
                columns.push({
                    ...this.schema[key],
                    dataIndex: key,
                    key,
                })
        })
        return (
            <Table
                columns={columns}
                size="small"
                pagination={false}
                dataSource={this.state.data.list}
            />
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
            })
            const list =
                data &&
                data.list.map((item, index) => {
                    return {
                        ...item,
                        connected_rate:
                            Math.round(item.connected_rate * 100 * 10 ** 2) /
                                10 ** 2 +
                            "%",
                    }
                })
            data = decorateList(list, this.schema)
            await exportData("详情", data, columns)
            this.setState({ exportLoading: false })
        })
        // this.handleVisibleExportModal()
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
        const operations = (
            <Button
                onClick={() => {
                    this.handleExport({}, this.schema)
                }}
            >
                导出
            </Button>
        )
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
                                renderOpeation: this.state.data.list.length ? (
                                    <Spin spinning={this.state.listLoading}>
                                        <Card bordered={false}>
                                            <Tabs
                                                tabBarExtraContent={operations}
                                                defaultActiveKey="1"
                                            >
                                                <TabPane tab="图表" key="1">
                                                    {this.renderSummary()}
                                                </TabPane>
                                                <TabPane tab="数据" key="2">
                                                    {this.handleRenderTable()}
                                                </TabPane>
                                            </Tabs>
                                        </Card>
                                    </Spin>
                                ) : (
                                    <Spin spinning={this.state.listLoading}>
                                        <Card bordered={false}>
                                            <Empty></Empty>
                                        </Card>
                                    </Spin>
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

    domainKeyChange = async (item) => {
        if (this.meta.initLocalStorageDomainKey) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: item,
            }
            let flow = await schemas.flow.service.get({
                limit: 1000,
                select: "id, key, domain_key, name",
                domain_key: item,
            })
            this.schema.flow_key.dict = listToDict(flow.list, "", "key", "name")
            let task = await schemas.outboundTask.service.get({
                limit: 1000,
                domain_key: item,
            })
            this.schema.task_id.dict = listToDict(task.list, "", "id", "name")
            console.log(this.schema.task_id)
        }
    }

    render() {
        return this.renderDataList()
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
