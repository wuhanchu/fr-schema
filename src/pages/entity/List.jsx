import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import {
    Select,
    Button,
    message,
    Descriptions,
    Card,
    Divider,
    Popconfirm,
    Tooltip,
} from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { LoadingOutlined, InfoCircleOutlined } from "@ant-design/icons"

import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import Modal from "antd/lib/modal/Modal"
import { listToDict } from "@/outter/fr-schema/src/dict"

const { decorateList } = frSchema
const { actions, utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        const importTemplateUrl = (BASE_PATH + "/import/实体.xlsx").replace(
            "//",
            "/"
        )
        super(props, {
            schema: schemas.entity.schema,
            service: schemas.entity.service,
            infoProps: {
                width: "900px",
            },
            queryArgs: { domain_key: props.domain_key },
            showDelete: true,
            showSelect: true,
            operateWidth: "180px",
            importTemplateUrl,
        })
    }

    componentWillReceiveProps(nextProps, nextContents) {
        super.componentWillReceiveProps(nextProps, nextContents)
        if (nextProps.domain_key !== this.props.domain_key) {
            // sth值发生改变下一步工作
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: nextProps.domain_key,
            }
            this.initTypeList()
            this.refreshList()
        }
    }

    async initTypeList() {
        const res = await schemas.entityType.service.get({
            pageSize: 10000,
            domain_key: this.meta.queryArgs.domain_key,
        })
        let typeList = utils.dict.listToDict(res.list, null, "key", "name")
        this.schema.type_key.props = {}
        this.schema.type_key.props.typeKeyArry = res.list
        this.schema.type_key.notRenderFormItem = true
        this.schema.type_key.renderInput = (
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
                options = props.typeKeyArry
                    .filter(
                        (item) =>
                            item.domain_key ===
                            props.form.current.getFieldsValue().domain_key
                    )
                    .map((item, index) => {
                        return { value: item.key, label: item.name }
                    })
            } else {
                options =
                    props &&
                    props.typeKeyArry
                        .filter((item) => {
                            if (tempData && tempData.domain_key)
                                return item.domain_key === tempData.domain_key
                            else {
                                return true
                            }
                        })
                        .map((item, index) => {
                            return { value: item.key, label: item.name }
                        })
            }
            return <Select {...props} options={options} allowClear></Select>
        }
        this.schema.type_key.dict = typeList
    }

    async componentDidMount() {
        this.initTypeList()
        this.schema.domain_key.dict = this.props.dict.domain
        super.componentDidMount()
    }

    renderInfoModal() {
        let onValuesChange = (data, item) => {
            if (data.domain_key) {
                this.infoForm.current.setFieldsValue({ type_key: null })
            }
        }
        return super.renderInfoModal({ onValuesChange })
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

    async handleGetAttr(record) {
        let attrArry = await schemas.entityAttr.service.get({
            entity_type_key: record.type_key,
            limit: 1000,
            domain_key: record.domain_key,
        })
        this.setState({
            attrArry: listToDict(attrArry.list, "", "key", "name"),
            isGetAttr: attrArry.list.length,
        })
        console.log(listToDict(attrArry.list, "", "key", "name"))
    }

    renderInfo() {
        const { record, attrArry, isGetAttr } = this.state
        let attribute = []
        if (record.attribute) {
            Object.keys(record.attribute).forEach((key) => {
                attribute.push({ key: key, value: record.attribute[key] })
            })
        }
        let attrDescriptions = []

        console.log(attribute)
        return (
            <Modal
                visible={this.state.showInfo}
                title={"详情"}
                width={1000}
                footer={false}
                onCancel={() => {
                    this.setState({ showInfo: false })
                }}
            >
                <Card
                    title={false}
                    style={{
                        marginBottom: 24,
                    }}
                    bodyStyle={{
                        overflowY: "auto",
                        maxHeight: "500px",
                    }}
                    bordered={false}
                >
                    <Descriptions
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Descriptions.Item label="域">
                            {
                                this.schema.domain_key.dict[record.domain_key]
                                    .name
                            }
                        </Descriptions.Item>
                        <Descriptions.Item label="类型">
                            {this.schema.type_key.dict[record.type_key].name}
                        </Descriptions.Item>
                        <Descriptions.Item label="名称">
                            {record.name}
                        </Descriptions.Item>
                        {record.remark && (
                            <Descriptions.Item label="备注">
                                {record.remark}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                    {attribute.length ? (
                        // <Card title={false}>
                        <div>
                            <Descriptions
                                style={{
                                    marginBottom: 16,
                                }}
                                title="属性"
                            >
                                {attribute.map((item) => {
                                    let value
                                    if (
                                        typeof item.value === "string" ||
                                        typeof item.value === "number"
                                    ) {
                                        value = item.value
                                    } else {
                                        value = (
                                            <pre>
                                                {JSON.stringify(
                                                    item.value,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        )
                                    }
                                    if (
                                        this.state.attrArry &&
                                        this.state.attrArry[item.key]
                                    ) {
                                        let label = this.state.attrArry[
                                            item.key
                                        ].name

                                        if (
                                            typeof value === "string" ||
                                            typeof value === "number"
                                        ) {
                                            return (
                                                <Descriptions.Item
                                                    span={3}
                                                    label={
                                                        <div
                                                            style={{
                                                                width: "100px",
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            {label}
                                                        </div>
                                                    }
                                                >
                                                    {/* {value} */}
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: value
                                                                ? value
                                                                      .toString()
                                                                      .replace(
                                                                          "<br/>",
                                                                          ""
                                                                      )
                                                                : "",
                                                        }}
                                                    ></div>
                                                </Descriptions.Item>
                                            )
                                        } else {
                                            return (
                                                <Descriptions.Item
                                                    span={3}
                                                    label={
                                                        <div
                                                            style={{
                                                                width: "100px",
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            {label}
                                                        </div>
                                                    }
                                                >
                                                    {value}
                                                </Descriptions.Item>
                                            )
                                        }
                                    } else {
                                        if (
                                            this.state.attrArry &&
                                            typeof value === "string"
                                        ) {
                                            console.log(item.key, value)

                                            return (
                                                <Descriptions.Item
                                                    span={3}
                                                    label={
                                                        <div
                                                            style={{
                                                                width: "100px",
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            {item.key}
                                                        </div>
                                                    }
                                                >
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: value
                                                                ? value.replace(
                                                                      "<br/>",
                                                                      ""
                                                                  )
                                                                : "",
                                                        }}
                                                    ></div>
                                                </Descriptions.Item>
                                            )
                                        } else {
                                            return (
                                                <Descriptions.Item
                                                    span={3}
                                                    label={
                                                        <div
                                                            style={{
                                                                width: "100px",
                                                                textAlign:
                                                                    "right",
                                                            }}
                                                        >
                                                            {item.key}
                                                        </div>
                                                    }
                                                >
                                                    {value}
                                                </Descriptions.Item>
                                            )
                                        }
                                    }
                                })}
                            </Descriptions>
                        </div>
                    ) : (
                        <></>
                    )}
                </Card>
            </Modal>
        )
    }

    renderExtend() {
        return <>{this.state.showInfo && this.renderInfo()}</>
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
                        {showEdit && (
                            <a
                                onClick={() =>
                                    this.handleVisibleModal(
                                        true,
                                        record,
                                        actions.edit
                                    )
                                }
                            >
                                修改
                            </a>
                        )}
                        <Divider type="vertical"></Divider>
                        {
                            <a
                                onClick={() => {
                                    this.setState({ showInfo: true, record })
                                    this.handleGetAttr(record)
                                }}
                            >
                                详情
                            </a>
                        }
                        {showDelete && (
                            <>
                                {showEdit && <Divider type="vertical" />}
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
                                            this.state.record.id ===
                                                record.id && (
                                                <LoadingOutlined />
                                            )}
                                        删除
                                    </a>
                                </Popconfirm>
                            </>
                        )}
                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
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
            let columns = [
                // column[0],
                {
                    title: "名称",
                    dataIndex: "name",
                    key: "name",
                },
                column[1],
                {
                    title: "备注",
                    dataIndex: "remark",
                    key: "remark",
                },
                {
                    title: "属性",
                    dataIndex: "attribute",
                    key: "attribute",
                },
            ]
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
            await exportData("实体", data, columns)
            this.setState({ exportLoading: false })
        })
    }

    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={{
                    type_key: this.schema.type_key,
                    name: this.schema.name,
                    remark: this.schema.remark,
                    attribute: this.schema.attribute,
                }}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                confirmLoading={this.state.confirmLoading}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    this.setState({ confirmLoading: true })
                    let attributeAttr = []
                    const data = this.state.importData.map((item) => {
                        let attribute = null
                        if (item.attribute) {
                            try {
                                attribute = JSON.parse(item.attribute)
                            } catch (error) {
                                message.error("请检查属性字段")
                            }
                        }

                        return {
                            ...this.meta.addArgs,
                            ...item,
                            domain_key: this.meta.queryArgs.domain_key,
                            attribute,
                        }
                    })
                    // let postData = data.filters
                    console.log(data)
                    try {
                        await this.service.post(data)
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
                }}
            />
        )
    }
    renderSearchBar() {
        const { name, type_key, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                type_key,
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
