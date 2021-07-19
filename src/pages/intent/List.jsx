import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Divider, Card, Modal, Button, message } from "antd"
import frSchema from "@/outter/fr-schema/src"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

const { decorateList } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.intent.schema,
            service: schemas.intent.service,
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    /**
     * 操作栏按钮
     */
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
                <Button
                    onClick={() => {
                        this.setState({ visibleImport: true })
                    }}
                >
                    导入
                </Button>

                <Button
                    loading={this.state.exportLoading}
                    // onClick={async () => {
                    //     this.setState({ exportLoading: true }, async () => {
                    //         let columns = this.getColumns(false).filter(
                    //             (item) => {
                    //                 return (
                    //                     !item.isExpand &&
                    //                     item.key !== "external_id"
                    //                 )
                    //             }
                    //         )

                    //         let data = await this.requestList({
                    //             pageSize: 1000000,
                    //         })
                    //         data = decorateList(data.list, this.schema)
                    //         console.log(columns)
                    //         columns[1].title = "意图"
                    //         columns = [columns[1], columns[2]]
                    //         await exportData("导出数据", data, columns)
                    //         this.setState({ exportLoading: false })
                    //     })
                    // }}
                    onClick={() => {
                        this.setState({ visibleExport: true })
                    }}
                >
                    导出
                </Button>
            </>
        )
    }
    handleVisibleExportModal = (flag, record, action) => {
        this.setState({
            visibleExport: !!flag,
            infoData: record,
            action,
        })
    }

    handleVisibleImportModal = (flag, record, action) => {
        this.setState({
            visibleImport: !!flag,
            infoData: record,
            action,
        })
    }
    async handleUploadExcel(data, schema) {
        // 更新
        let response
        try {
            response = await this.service.uploadExcel(
                { ...data, file: data.file.file },
                schema
            )
        } catch (error) {
            message.error(error.message)
            this.handleVisibleImportModal()
            return
        }

        this.refreshList()
        message.success("添加成功")
        this.handleVisibleImportModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    async handleExport(args, schema) {
        this.setState({ exportLoading: true }, async () => {
            let columns = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "external_id"
            })

            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
            })
            data = decorateList(data.list, this.schema)
            console.log(columns)
            columns[1].title = "意图"
            columns = [columns[1], columns[2]]
            await exportData("导出数据", data, columns)
            this.setState({ exportLoading: false })
        })
        this.handleVisibleExportModal()

        // 更新
        // let response
        // try {
        //     response = await this.service.uploadExcel(
        //         { ...data, file: data.file.file },
        //         schema
        //     )
        // } catch (error) {
        //     message.error(error.message)
        //     this.handleVisibleExportModal()
        //     return
        // }

        // // this.refreshList()
        // // message.success("添加成功")
        // this.handleVisibleExportModal()
        // this.handleChangeCallback && this.handleChangeCallback()
        // this.props.handleChangeCallback && this.props.handleChangeCallback()

        // return response
    }

    renderExportModal() {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleExport, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleExportModal.bind(this),
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleExport.bind(this),
        }

        const schema = {
            domain_key: {
                title: "域",
                required: true,
                extra: "意图对应的域",
                type: schemaFieldType.Select,
                dict: this.props.dict.domain,
            },
        }

        return (
            visibleExport && (
                <InfoModal
                    renderForm={renderForm}
                    title={"导出"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleExport}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={schema}
                    width={600}

                    // {...customProps}
                />
            )
        )
    }

    renderImportModal() {
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
            handleAdd: this.handleUploadExcel.bind(this),
        }

        const schema = {
            domain_key: {
                title: "域",
                required: true,
                extra: "意图对应的域",
                type: schemaFieldType.Select,
                dict: this.props.dict.domain,
            },
            file: {
                title: "文件",
                required: true,
                extra: "必须包含意图列和例子列",
                type: schemaFieldType.Upload,
            },
        }

        return (
            visibleImport && (
                <InfoModal
                    renderForm={renderForm}
                    title={"导入"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleImport}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={schema}
                    width={600}

                    // {...customProps}
                />
            )
        )
    }

    renderExtend() {
        return <>{this.renderExportModal()}</>
    }
    // 搜索
    renderSearchBar() {
        const { name, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
