import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Divider, Button } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { listToDict } from "@/outter/fr-schema/src/dict"
import ImportModal from "./ImportModal"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

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
            showDelete: true,
            showSelect: true,
            initLocalStorageDomainKey: true,
            operateWidth: "170px",
        })
    }

    async componentDidMount() {
        let dict = await schemas.outboundTask.service.getDict({ type: 1 })
        super.componentDidMount()
        this.schema.caller_group_id.dict = listToDict(
            dict.list,
            "",
            "KEY",
            "VALUE"
        )
        this.schema.domain_key.dict = this.props.dict.domain
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
                <Button
                    onClick={() => {
                        this.setState({ visibleImport: true })
                    }}
                >
                    导入
                </Button>

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

    handleVisibleImportModal = (flag, record, action) => {
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
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleImport, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleImportModal.bind(this),
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleAdd.bind(this),
        }

        return (
            visibleImport && (
                <InfoModal
                    renderForm={renderForm}
                    title={title}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleImport}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={this.schema}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }
    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({
                            showYamlEdit: true,
                            record,
                        })
                    }}
                >
                    内容
                </a>
            </>
        )
    }
}

export default List
