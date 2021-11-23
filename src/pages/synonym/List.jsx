import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import frSchema from "@/outter/fr-schema/src"
import { Button, message } from "antd"
const { decorateList } = frSchema
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
            schema: schemas.synonym.schema,
            service: schemas.synonym.service,
            operateWidth: "120px",
            importTemplateUrl,
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    renderContentModal() {
        const { id } = this.schema
        const { record } = this.state
        const content = {
            title: "内容",
            props: {
                style: { width: "500px" },
                height: "400px",
            },
            type: schemaFieldType.AceEditor,
            decoratorProps: { rules: verifyJson },
        }
        return (
            this.state.showContentModal && (
                <InfoModal
                    title="如果当前数据异常，请填写备注，跳过当前数据！"
                    action={actions.edit}
                    handleUpdate={async (values) => {
                        try {
                            const res = await this.service.patch({
                                id: record.id,
                                label: values.label,
                                operation: "error",
                                remark: values.remark,
                            })
                            message.success(res.message)
                            this.refreshList()
                            this.setState({ showContentModal: false })
                        } catch (e) {
                            message.error(e.message)
                        }
                    }}
                    values={record}
                    visible
                    onCancel={() => this.setState({ showContentModal: false })}
                    schema={{
                        id,
                        content,
                    }}
                />
            )
        )
    }

    renderExtend() {
        return <>{this.renderContentModal()}</>
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
                return !item.isExpand && item.key !== "external_id"
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
                schema={this.schema}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    let attributeAttr = []
                    const data = this.state.importData.map((item) => {
                        let extend_text = null
                        if (item.extend_text) {
                            try {
                                extend_text = item.extend_text.split("|")
                            } catch (error) {
                                message.error("请检查扩展文本字段")
                            }
                        }
                        return {
                            ...this.meta.addArgs,
                            ...item,
                            extend_text,
                        }
                    })
                    // let postData = data.filters
                    await this.service.upInsert(data)
                    message.success("导入成功")
                    this.setState({ visibleImport: false })
                    this.refreshList()
                }}
            />
        )
    }

    renderSearchBar() {
        const { standard_text, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                standard_text,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
