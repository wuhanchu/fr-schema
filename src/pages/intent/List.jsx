import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Divider, Card, Modal, Button } from "antd"
import frSchema from "@/outter/fr-schema/src"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"

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
                {/* <Button
                    onClick={() => {
                        this.setState({ visibleImport: true })
                    }}
                >
                    导入
                </Button> */}

                <Button
                    loading={this.state.exportLoading}
                    onClick={async () => {
                        this.setState({ exportLoading: true }, async () => {
                            let columns = this.getColumns(false).filter(
                                (item) => {
                                    return (
                                        !item.isExpand &&
                                        item.key !== "external_id"
                                    )
                                }
                            )

                            let data = await this.requestList({
                                pageSize: 1000000,
                            })
                            data = decorateList(data.list, this.schema)
                            columns = [...columns]
                            await exportData("导出数据", data, columns)
                            this.setState({ exportLoading: false })
                        })
                    }}
                >
                    导出
                </Button>
            </>
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
            download: {
                title: "下载",
                renderInput: () => {
                    return (
                        <a
                            href="./import/掌数_知料_知识库信息导入.xlsx"
                            download
                        >
                            <Button>下载模板文件</Button>
                        </a>
                    )
                },
            },
            file: {
                title: "文件",
                required: true,
                extra: "图片导入仅支持wps编辑的.xlsx文件",
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
