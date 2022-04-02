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
    Menu,
    Spin,
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
    PrinterTwoTone,
    ProfileTwoTone,
    SecurityScanTwoTone,
    SwitcherTwoTone,
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
            schema: { ...schemas.outboundTask.statisticsSchema },
            service: {
                ...schemas.outboundTask.service,
                get: schemas.outboundTask.service.getStatistics,
            },
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
                task_id: props.task_id,
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
        this.setState({
            searchValues: {
                // domain_key: "default",
                begin_time: moment().subtract("days", 6),
            },
        })
        let flow = await schemas.flow.service.get({
            limit: 1000,
            select: "id, key, domain_key, name",
        })
        this.schema.flow_key.dict = listToDict(flow.list, "", "key", "name")
        await this.findUserList()
        super.componentDidMount()
    }

    async findUserList() {
        let res = await userService.get({ pageSize: 10000, select: "id, name" })
        this.schema.user_id.dict = listToDict(res.list, null, "id", "name")
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
                                    总外呼
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
                                    接通
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.connected : 0}
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
                                    未接通
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.no_connect : 0}
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
                                    接通率
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary
                                        ? formatData(
                                              summary.connected_rate || 0,
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
                                    无应答
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.no_answer : 0}
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
                                    拨打失败
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.failed : 0}
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
                                    忙线
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.busy : 0}
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
                                    空号
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.empty : 0}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
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
                                <PrinterTwoTone
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
                                    关机
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.shutdown : 0}
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
                                <ProfileTwoTone
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
                                    拒接
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.refuse : 0}
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
                                <SecurityScanTwoTone
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
                                    停机
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.halt : 0}
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
                                <SwitcherTwoTone
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
                                    其他
                                </div>
                                <div
                                    style={{
                                        marginTop: "px",
                                        fontSize: "20px",
                                    }}
                                >
                                    {summary ? summary.other : 0}
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
                    style={{ width: "100%", marginTop: "-24px" }}
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
                                renderOpeation: (
                                    <Spin spinning={this.state.listLoading}>
                                        {this.renderSummary()}
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

    render() {
        return this.renderDataList()
    }
}

export default List
