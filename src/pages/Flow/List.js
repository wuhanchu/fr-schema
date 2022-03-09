import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import InfoModal from "./InfoModal"
import { getTree } from "./methods"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import DialogueModal from "@/pages/question/components/DialogueModal"
import {
    Divider,
    Modal,
    Button,
    message,
    Popconfirm,
    Select,
    TreeSelect,
} from "antd"
import frSchema from "@/outter/fr-schema/src"
import ChartModal from "./Flow"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { async } from "@antv/x6/lib/registry/marker/main"
import { listToDict } from "@/outter/fr-schema/src/dict"
import { LoadingOutlined } from "@ant-design/icons"
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
            operateWidth: "320px",
            showDelete: true,
            showSelect: true,
            infoProps: {
                width: "900px",
            },
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    async componentDidMount() {
        let intent = await schemas.intent.service.get({ limit: 9999 })

        let intentList = getTree(intent.list)

        let project = await schemas.project.service.get({ limit: 9999 })
        this.schema.project_id.dict = listToDict(project.list, "", "id", "name")
        this.schema.project_id.props.projectarry = project.list
        this.schema.project_id.renderInput = (
            item,
            tempData,
            props,
            action,
            form
        ) => {
            let options = []
            this.infoForm = props.form
            if (
                props.form &&
                props.form.current &&
                props.form.current.getFieldsValue().domain_key
            ) {
                options = props.projectarry
                    .filter(
                        (item) =>
                            item.domain_key ===
                                props.form.current.getFieldsValue()
                                    .domain_key ||
                            (this.props.dict.domain[
                                props.form.current.getFieldsValue().domain_key
                            ].base_domain_key &&
                                this.props.dict.domain[
                                    props.form.current.getFieldsValue()
                                        .domain_key
                                ].base_domain_key.indexOf(item.domain_key) > -1)
                    )
                    .map((item, index) => {
                        return { value: item.id, label: item.name }
                    })
            } else {
                options = props.projectarry
                    .filter((item) => {
                        if (tempData.domain_key)
                            return (
                                item.domain_key === tempData.domain_key ||
                                (this.props.dict.domain[tempData.domain_key]
                                    .base_domain_key &&
                                    this.props.dict.domain[
                                        tempData.domain_key
                                    ].base_domain_key.indexOf(item.domain_key) >
                                        -1)
                            )
                        else {
                            return true
                        }
                    })
                    .map((item, index) => {
                        return {
                            value: item.id,
                            label: item.name,
                            key: item.id,
                        }
                    })
            }
            return (
                <Select
                    {...props}
                    options={options}
                    mode="multiple"
                    allowClear
                ></Select>
            )
        }
        this.schema.intent_key.dict = listToDict(intent.list, "", "key", "name")
        this.schema.intent_key.renderInput = (
            item,
            tempData,
            props,
            action,
            form
        ) => {
            let options = []
            this.infoForm = props.form
            if (
                props.form &&
                props.form.current &&
                props.form.current.getFieldsValue().domain_key
            ) {
                options = intent.list.filter(
                    (item) =>
                        item.domain_key ===
                            props.form.current.getFieldsValue().domain_key ||
                        (this.props.dict.domain[
                            props.form.current.getFieldsValue().domain_key
                        ].base_domain_key &&
                            this.props.dict.domain[
                                props.form.current.getFieldsValue().domain_key
                            ].base_domain_key.indexOf(item.domain_key) > -1)
                )
                options = getTree(options)
                console.log(options)
            } else {
                options = intent.list.filter((item) => {
                    if (tempData.domain_key)
                        return (
                            item.domain_key === tempData.domain_key ||
                            (this.props.dict.domain[tempData.domain_key]
                                .base_domain_key &&
                                this.props.dict.domain[
                                    tempData.domain_key
                                ].base_domain_key.indexOf(item.domain_key) > -1)
                        )
                    else {
                        return true
                    }
                })
                setTimeout(() => {
                    console.log(options)
                }, 200)
                console.log(options)
                options = getTree(options)
                console.log(getTree(options))
            }
            return (
                <TreeSelect
                    showSearch
                    allowClear
                    // treeCheckable="true"
                    // showCheckedStrategy="SHOW_PARENT"
                    multiple
                    treeNodeFilterProp="name"
                    style={{ width: "500px" }}
                    placeholder={"请选择意图"}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    treeData={options}
                    treeDefaultExpandAll
                />
            )
        }
        this.setState({ intentDict: intent.list, projectDict: project.list })
        super.componentDidMount()
    }

    renderInfoModal() {
        // let onValuesChange = (data, item) => {
        //     if (data.domain_key) {
        //         this.infoForm.current.setFieldsValue({ project_id: [] })
        //     }
        // }
        return super.renderInfoModal()
    }

    renderOperateColumn(props = {}) {
        const { scroll } = this.meta
        const { inDel } = this.state
        const { showEdit = true, showDelete = true } = {
            ...this.meta,
            ...props,
        }
        return (
            !this.meta.readOnly &&
            !this.props.readOnly && {
                title: "操作",
                width: this.meta.operateWidth,
                fixed: "right",
                render: (text, record) => (
                    <>
                        <a
                            onClick={() => {
                                this.handleVisibleModal(true, record, "edit")
                                this.setState({ domain_key: record.domain_key })
                            }}
                        >
                            修改
                        </a>
                        <Divider type="vertical" />
                        <Popconfirm
                            title="是否要删除此行？"
                            onConfirm={async (e) => {
                                this.setState({ record })
                                await this.handleDelete(record)
                                e.stopPropagation()
                            }}
                        >
                            <a>
                                {inDel &&
                                    this.state.record.id &&
                                    this.state.record.id === record.id && (
                                        <LoadingOutlined />
                                    )}
                                删除
                            </a>
                        </Popconfirm>
                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
        )
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({
                            record,
                            visibleDialogue: true,
                            infoData: record,
                        })
                    }}
                >
                    对话
                </a>
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
        const {
            visibleFlow,
            record,
            visibleCodeModal,
            projectDict,
            intentDict,
            visibleDialogue,
        } = this.state
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
                        projectDict={projectDict}
                        intentDict={intentDict}
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
                {visibleDialogue && (
                    <DialogueModal
                        type={"domain_id"}
                        dialogueType={"flow"}
                        flowKey={record.key}
                        record={{ ...record, key: record.domain_key }}
                        visibleDialogue={visibleDialogue}
                        title={"对话" + "(" + record.name + ")"}
                        handleHideDialogue={() =>
                            this.setState({ visibleDialogue: false })
                        }
                    />
                )}
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
        // if (this.props.renderInfoModal) {
        //     return this.props.renderInfoModal()
        // }
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
                {
                    title: "意图匹配辅助信息",
                    dataIndex: "intent_key_text",
                    key: "intent_key_text",
                },
                {
                    title: "全局配置",
                    dataIndex: "slot",
                    key: "slot",
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
                    return {
                        ...item,
                        config: JSON.stringify(item.config),
                        intent_key:
                            item.intent_key && item.intent_key.join("|"),
                        slot: item.slot && JSON.stringify(item.slot),
                    }
                })
            data = decorateList(list, this.schema)
            await exportData("流程", data, columns)
            this.setState({ exportLoading: false })
        })
        // this.handleVisibleExportModal()
    }
    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                confirmLoading={this.state.confirmLoading}
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
                        this.setState({ confirmLoading: true })
                        const data = this.state.importData.map((item) => {
                            console.log(
                                item.intent_key
                                    ? item.intent_key.split("|")
                                    : "unl"
                            )
                            return {
                                ...item,
                                id: item.id || undefined,
                                config: JSON.parse(item.config),
                                slot: item.slot ? JSON.parse(item.slot) : {},
                                intent_key: item.intent_key
                                    ? item.intent_key.split("|")
                                    : [],
                            }
                        })
                        await this.service.upInsert(data)
                    } catch (e) {
                        message.error(e.message)
                    }

                    this.setState({
                        visibleImport: false,
                        confirmLoading: false,
                    })
                    this.refreshList()
                }}
            />
        )
    }

    // 搜索
    renderSearchBar() {
        const { name, domain_key, project_id } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
                // project_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
