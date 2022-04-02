import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Divider, Button, message, Modal, Popconfirm } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { listToDict } from "@/outter/fr-schema/src/dict"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import FileSaver from "file-saver"
import Result from "./Result"
import XLSX from "xlsx"
import Statistics from "./Statistics"
import userService from "@/pages/authority/user/service"
import { convertFormImport } from "@/outter/fr-schema/src/schema"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"

@connect(({ global, user }) => ({
    dict: global.dict,
    user: user,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        const importTemplateUrl = (BASE_PATH + "/import/客户信息.xlsx").replace(
            "//",
            "/"
        )
        super(props, {
            schema: schemas.outboundTask.schema,
            service: schemas.outboundTask.service,
            importTemplateUrl,
            showDelete: false,
            showEdit: false,
            search: {
                span: 6,
            },
            initLocalStorageDomainKey: true,
            operateWidth: "240px",
        })
    }

    async componentDidMount() {
        console.log(this.props)
        let dict = await schemas.outboundTask.service.getDict({ type: 1 })
        await this.findUserList()
        this.schema.caller_group_id.dict = listToDict(
            dict.list,
            "",
            "KEY",
            "VALUE"
        )

        let flow = await schemas.flow.service.get({
            limit: 1000,
            select: "id, key, domain_key, name",
            domain_key: this.state.localStorageDomainKey,
        })
        this.schema.flow_key.dict = listToDict(flow.list, "", "key", "name")

        let callerArray = []
        let response = await Promise.all(
            dict.list.map(async (item) => {
                let res = await schemas.outboundTask.service.getDict({
                    type: 2,
                    caller_group_id: item.KEY,
                })
                console.log(res)
                callerArray = [...callerArray, ...res.list]
            })
        )

        this.schema.caller_number.dict = listToDict(
            callerArray,
            "",
            "KEY",
            "VALUE"
        )
        this.schema.domain_key.dict = this.props.dict.domain
        super.componentDidMount()
    }

    getExcelData = async (file) => {
        const reader = new FileReader()
        let maxLength = 1000
        let sliceNum = 1
        let dataArray = []

        await new Promise((resolve, reject) => {
            reader.onload = (async (evt) => {
                // parse excel

                const schema = schemas.customer.schema
                const binary = evt.target.result
                const wb = XLSX.read(binary, { type: "binary" })
                const sheetName = wb.SheetNames[0]
                const ws = wb.Sheets[sheetName]
                let data = XLSX.utils.sheet_to_json(ws, {
                    raw: false,
                    header: "A",
                    defval: "",
                    dateNF: "YYYY/MM/DD",
                })

                try {
                    // 判断数据长度
                    if (maxLength && data && data.length > maxLength) {
                        throw new Error(
                            `每次导入最多只允许导入${maxLength}条数据！`
                        )
                    }

                    data = await convertFormImport(
                        data,
                        schema,
                        sliceNum,
                        "id" || Object.keys(schema)[0]
                    )

                    dataArray = data.map((item) => {
                        return {
                            phone: item.telephone,
                            auto_maxtimes: item.auto_maxtimes,
                            slot: { ...item, block: item.block === "true" },
                        }
                    })
                    this.setState((state) => ({
                        fileList: [file],
                    }))
                    resolve()
                } catch (e) {
                    message.error(e.message)
                } finally {
                    // this.setState({ beforeUploadLoading: false })
                }
            }).bind(this)

            //here our function should be implemented
            reader.readAsBinaryString(file)
        })

        return dataArray
    }

    async handleAdd(data, schema) {
        // 更新
        let response
        try {
            response = await this.service.post(
                { ...data, user_id: this.props.user.currentUser.id },
                schema
            )
            this.refreshList()
            message.success("添加成功")
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }
    async handleImportData(data, schema) {
        // 更新
        let response
        try {
            let number_group = await this.getExcelData(data.number_group.file)
            response = await this.service.importData(
                {
                    ...data,
                    number_group: number_group,
                    task_id: this.state.infoData.external_id,
                    id: undefined,
                },
                schema
            )

            this.refreshList()
            message.success("添加成功")
            this.handleVisibleImportModal()
        } catch (error) {
            message.error(error.message)
        }
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    renderOperationButtons() {
        if (this.props.renderOperationButtons) {
            return this.props.renderOperationButtons()
        }

        return (
            <>
                {!this.props.readOnly && !this.meta.addHide && (
                    <Button
                        type="primary"
                        onClick={() =>
                            this.handleVisibleModal(true, null, "add")
                        }
                    >
                        新增
                    </Button>
                )}

                {/* <Button
                    loading={this.state.exportLoading}
                    onClick={() => {
                        // this.setState({ visibleExport: true })
                        console.log("data")
                        this.handleExport()
                    }}
                >
                    导出
                </Button> */}
            </>
        )
    }

    renderExtend() {
        const { record, showInfo, showStatistics } = this.state
        return (
            <>
                {showInfo && (
                    <Modal
                        title={"详情"}
                        width={"95%"}
                        visible={showInfo}
                        footer={null}
                        onCancel={() => {
                            this.setState({ showInfo: false })
                        }}
                    >
                        <Result task_id={record.id} record={record} />
                    </Modal>
                )}
                {showStatistics && (
                    <Modal
                        title={"统计"}
                        width={"1200px"}
                        visible={showStatistics}
                        footer={null}
                        onCancel={() => {
                            this.setState({ showStatistics: false })
                        }}
                    >
                        <Statistics task_id={record.id} />
                    </Modal>
                )}
            </>
        )
    }

    handleVisibleImportModal = (flag, record, action) => {
        console.log(record)
        this.setState({
            visibleImport: !!flag,
            infoData: record,
            action,
        })
    }

    async handleExport(args, schema) {
        this.setState({ exportLoading: true }, async () => {
            let column = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "domain_key"
            })
            let columns = column
            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
            })
            let list = data.list
            list = list.map((item) => {
                return {
                    ...item,
                    attribute: item.attribute
                        ? JSON.stringify(item.attribute)
                        : "",
                }
            })
            data = decorateList(list, this.schema)
            await exportData("专业词汇", data, columns)
            this.setState({ exportLoading: false })
        })
    }

    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={schemas.customer.schema}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                confirmLoading={this.state.confirmLoading}
                onOk={async () => {
                    // to convert
                    this.setState({
                        confirmLoading: true,
                    })
                    let data = this.state.importData
                    try {
                        let number_group = data.map((item) => {
                            return {
                                phone: item.telephone,
                                auto_maxtimes: item.auto_maxtimes,
                                slot: { ...item, block: item.block === "true" },
                            }
                        })
                        // await this.service.upInsert(data)
                        await this.service.importData(
                            {
                                // ...data,
                                number_group: number_group,
                                task_id: this.state.infoData.external_id,
                                id: undefined,
                            },
                            schemas.customer.schema
                        )

                        this.refreshList()
                        message.success("导入成功")
                        this.setState({
                            visibleImport: false,
                            confirmLoading: false,
                        })
                        this.refreshList()
                    } catch (error) {
                        message.error(error.message)
                        this.setState({
                            confirmLoading: false,
                        })
                    }
                    // let postData = data.filters
                }}
            />
        )
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                {/* <Divider type="vertical" /> */}
                <a
                    onClick={() => {
                        // this.handleVisibleImportModal(true, record, "add")
                        this.setState({
                            visibleImport: true,
                            infoData: record,
                            record,
                        })
                    }}
                >
                    导入
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ showInfo: true, record })
                    }}
                >
                    详情
                </a>
                {record.status !== "end" && (
                    <>
                        <Divider type="vertical" />
                        {record.status === "wait" ||
                        record.status === "suspend" ? (
                            <Popconfirm
                                title="是否要开启任务？"
                                onConfirm={async (e) => {
                                    this.setState({ record })
                                    await schemas.outboundTask.service.changeTaskStatus(
                                        {
                                            task_id: record.external_id,
                                            status: "running",
                                        }
                                    )
                                    this.refreshList()
                                    message.success("开启成功")
                                    e.stopPropagation()
                                }}
                            >
                                <a>开启</a>
                            </Popconfirm>
                        ) : (
                            <Popconfirm
                                title="是否要停止任务？"
                                onConfirm={async (e) => {
                                    this.setState({ record })
                                    await schemas.outboundTask.service.changeTaskStatus(
                                        {
                                            task_id: record.external_id,
                                            status: "suspend",
                                        }
                                    )
                                    this.refreshList()
                                    message.success("暂停成功")
                                    e.stopPropagation()
                                }}
                            >
                                <a>暂停</a>
                            </Popconfirm>
                        )}
                    </>
                )}
                <Divider type="vertical" />
                <Popconfirm
                    title="是否要同步任务数据？"
                    onConfirm={async (e) => {
                        this.setState({ record })
                        await schemas.outboundTask.service.syncTaskResult({
                            task_id: record.external_id,
                        })
                        this.refreshList()
                        message.success("同步中！")
                        e.stopPropagation()
                    }}
                >
                    <a>同步</a>
                </Popconfirm>
                <Divider type="vertical" />
                <a
                    onClick={async () => {
                        this.setState({
                            showStatistics: true,
                            record,
                        })
                        // this.refreshList()
                    }}
                >
                    统计
                </a>
            </>
        )
    }

    async findUserList() {
        let res = await userService.get({ pageSize: 10000, select: "id, name" })
        this.schema.user_id.dict = listToDict(res.list, null, "id", "name")
    }
}

export default List
