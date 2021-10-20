import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Divider, Modal, Button, message } from "antd"
import frSchema from "@/outter/fr-schema/src"
import ChartModal from "./Flow"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { async } from "@antv/x6/lib/registry/marker/main"

const { decorateList } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
    data: global.data,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        const importTemplateUrl = (BASE_PATH + "/import/流程.xlsx").replace(
            "//",
            "/"
        )
        super(props, {
            schema: schemas.flow.schema,
            service: schemas.flow.service,
            importTemplateUrl,
            operateWidth: "270px",
            // infoProps: {
            //     width: "900px",
            // },
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        window.__isReactDndBackendSetUp = undefined
                        this.setState({ record, visibleFlow: true })
                    }}
                >
                    流程编辑
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({
                            record,
                            visibleCodeModal: true,
                            infoData: record,
                        })
                    }}
                >
                    流程代码
                </a>
            </>
        )
    }

    renderExtend() {
        const { visibleFlow, record, visibleCodeModal } = this.state
        return (
            <>
                <Modal
                    title={"流程编辑"}
                    visible={visibleFlow}
                    width={"90%"}
                    keyboard={false}
                    style={{ top: 20, bottom: 20 }}
                    footer={null}
                    destroyOnClose={true}
                    onOk={() => {
                        console.log(window.__isReactDndBackendSetUp)
                        this.setState({ visibleFlow: false })
                    }}
                    onCancel={() => {
                        this.setState({ visibleFlow: false })
                    }}
                    closable={false}
                >
                    <ChartModal
                        visibleRelease={false}
                        record={record}
                        handleSetVisibleFlow={(args) => {
                            this.setState({ visibleFlow: args })
                            this.refreshList()
                        }}
                        other={{ data: this.props.data, dict: this.props.dict }}
                        dict={this.props.data}
                        schemas={schemas.flow}
                        service={this.service}
                    />
                </Modal>
                {visibleCodeModal && this.renderCodeModal()}
            </>
        )
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
                        this.handleExport({}, {})
                    }}
                >
                    导出
                </Button>
            </>
        )
    }

    handleCodeVisibleModal = (flag, record, action) => {
        this.setState({
            visibleCodeModal: !!flag,
            infoData: record,
            action,
        })
    }

    renderCodeModal(customProps = {}) {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleCodeModal, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleCodeVisibleModal.bind(this),
            handleUpdate: async (args) => {
                await this.handleUpdate({
                    ...args,
                    domain_key: infoData.domain_key,
                    key: infoData.key,
                }),
                    this.setState({ visibleCodeModal: false })
            },
            handleAdd: this.handleAdd.bind(this),
        }
        return (
            visibleCodeModal && (
                <InfoModal
                    renderForm={renderForm}
                    title={"流程代码"}
                    action={"edit"}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleCodeModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    {...this.meta.infoProps}
                    {...customProps}
                    schema={{
                        config: {
                            ...this.schema.config,
                            isNoTitle: true,
                            editHide: false,
                            span: 24,
                        },
                    }}
                    bodyStyle={{ paddingBottom: "0px" }}
                    width={"952px"}
                />
            )
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

    async handleExport(args, schema) {
        this.setState({ exportLoading: true }, async () => {
            let column = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "external_id"
            })
            let columns = [
                column[0],
                {
                    title: "名称",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "编码",
                    dataIndex: "key",
                    key: "key",
                },
                {
                    title: "流程配置",
                    dataIndex: "config",
                    key: "config",
                },
                {
                    title: "意图",
                    dataIndex: "intent_key",
                    key: "intent_key",
                },
            ]
            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
                logical_path: undefined,
            })
            const list =
                data &&
                data.list.map((item, index) => {
                    return { ...item, config: JSON.stringify(item.config) }
                })
            data = decorateList(list, this.schema)
            await exportData("意图", data, columns)
            this.setState({ exportLoading: false })
        })
        // this.handleVisibleExportModal()
    }
    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={{
                    ...this.schema,
                    config: { title: "流程配置" },
                    intent_key: { title: "意图" },
                }}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    try {
                        const data = this.state.importData.map((item) => {
                            return {
                                ...item,
                                id: item.id || undefined,
                                config: JSON.parse(item.config),
                                intent_key: [],
                            }
                        })
                        await this.service.upInsert(data)
                    } catch (e) {
                        message.error(e.message)
                    }

                    this.setState({ visibleImport: false })
                    this.refreshList()
                }}
            />
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
