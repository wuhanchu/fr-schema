import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Divider, Button, message, Modal } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { listToDict } from "@/outter/fr-schema/src/dict"
import ImportModal from "./ImportModal"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import FileSaver from "file-saver"
import Result from "./Result"
import XLSX from "xlsx"
import { convertFormImport } from "@/outter/fr-schema/src/schema"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        const importTemplateUrl = (BASE_PATH + "/import/专业词汇.xlsx").replace(
            "//",
            "/"
        )
        super(props, {
            schema: schemas.outboundTask.schema,
            service: schemas.outboundTask.service,
            importTemplateUrl,
            showDelete: false,
            showEdit: false,
            showSelect: true,
            initLocalStorageDomainKey: true,
            operateWidth: "200px",
        })
    }

    async componentDidMount() {
        let dict = await schemas.outboundTask.service.getDict({ type: 1 })
        this.schema.caller_group_id.dict = listToDict(
            dict.list,
            "",
            "KEY",
            "VALUE"
        )

        let flow = await schemas.flow.service.get({
            limit: 1000,
            select: "id, key, domain_key, name",
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

                const schema = schemas.outboundTask.fileSchema
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
                    // this.props.onChange(data)
                    console.log(data)
                    dataArray = data
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

    async handleImportData(data, schema) {
        // 更新
        let response
        try {
            let number_group = await this.getExcelData(data.number_group.file)
            number_group = number_group.map((item) => {
                return {
                    ...item,
                    slot: item.slot ? JSON.parse(item.slot) : {},
                    // cstm_param: item.cstm_param? JSON.parse(item.cstm_param): {},
                }
            })
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
                    onClick={() => {
                        this.setState({ visibleImport: true })
                    }}
                >
                    导入
                </Button> */}

                <Button
                    loading={this.state.exportLoading}
                    onClick={() => {
                        // this.setState({ visibleExport: true })
                        console.log("data")
                        this.handleExport()
                    }}
                >
                    导出
                </Button>
            </>
        )
    }

    renderExtend() {
        const { record } = this.state
        return (
            <>
                {this.state.showInfo && (
                    <Modal
                        title={"详情"}
                        width={"80%"}
                        visible={this.state.showInfo}
                        footer={null}
                        onCancel={() => {
                            this.setState({ showInfo: false })
                        }}
                    >
                        <Result task_id={record.id} />
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

    renderImportModal(customProps) {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleImport, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleImportModal.bind(this),
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleImportData.bind(this),
        }

        return (
            visibleImport && (
                <InfoModal
                    renderForm={renderForm}
                    title={title}
                    action={"add"}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleImport}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={schemas.outboundTask.importSchema}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }
    renderOperateColumnExtend(record) {
        return (
            <>
                {/* <Divider type="vertical" /> */}
                <a
                    onClick={() => {
                        this.handleVisibleImportModal(true, record, "add")
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
                            <a
                                onClick={async () => {
                                    await schemas.outboundTask.service.changeTaskStatus(
                                        {
                                            task_id: record.external_id,
                                            status: "running",
                                        }
                                    )
                                    this.refreshList()
                                    message.success("开启成功")
                                }}
                            >
                                开启
                            </a>
                        ) : (
                            <a
                                onClick={async () => {
                                    await schemas.outboundTask.service.changeTaskStatus(
                                        {
                                            task_id: record.external_id,
                                            status: "suspend",
                                        }
                                    )
                                    this.refreshList()
                                    message.success("暂停成功")
                                }}
                            >
                                暂停
                            </a>
                        )}
                    </>
                )}
            </>
        )
    }
}

export default List
