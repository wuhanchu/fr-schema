import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import schemas from "@/schemas"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import Authorized from "@/outter/fr-schema-antd-utils/src/components/Authorized/Authorized"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import {
    Divider,
    Col,
    Modal,
    Button,
    Upload,
    message,
    Row,
    Spin,
    Empty,
    AutoComplete,
} from "antd"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import React from "react"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import * as _ from "lodash"
import clone from "clone"
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons"
import {
    exportData,
    exportDataByTemplate,
} from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { checkedAndUpload } from "@/utils/minio"
import frSchema from "@/outter/fr-schema/src"
const { decorateList } = frSchema

const confirm = Modal.confirm
const Minio = require("minio")

@Form.create()
class BaseList extends DataList {
    constructor(props) {
        const importTemplateUrl = (
            BASE_PATH + "/import/掌数_知料_知识库信息导入.xlsx"
        ).replace("//", "/")
        let config =
            props.record.config && props.record.config.info_schema
                ? props.record.config.info_schema
                : {}

        console.log(config)
        Object.keys(config).forEach(function (key) {
            console.log(config[key])
            config[key].isExpand = true
        })
        super(props, {
            operateWidth: 150,
            schema: clone({ ...schemas.question.schema, ...config }),
            service: schemas.question.service,
            allowExport: true,
            showSelect: true,
            allowImport: true,
            infoProps: {
                offline: true,
                width: "1100px",
                isCustomize: true,
                customize: {
                    left: 10,
                    right: 14,
                },
            },
            importTemplateUrl,
        })
    }

    async componentDidMount() {
        const response = await this.service.get({
            ...this.meta.queryArgs,
            select: "label,group",
            limit: 9999,
        })

        let labelDictList = {}
        let groupDictList = {}

        response.list.forEach((item) => {
            if (!_.isNil(item.label)) {
                item.label.forEach((value) => {
                    console.log(value)
                    labelDictList[value] = {
                        value: value,
                        remark: value,
                    }
                })
            }
            if (!_.isNil(item.group)) {
                groupDictList[item.group] = {
                    value: item.group,
                    remark: item.group,
                }
            }
        })
        this.setState({
            attachment: [],
            loadingAnnex: false,
        })
        this.schema.label.dict = labelDictList
        this.schema.group.dict = groupDictList
        let options = []
        Object.keys(groupDictList).forEach(function (key) {
            options.push(
                <AutoComplete.Option
                    key={groupDictList[key].value}
                    value={groupDictList[key].value}
                >
                    {groupDictList[key].remark}
                </AutoComplete.Option>
            )
        })
        this.schema.group.renderInput = () => {
            return (
                <AutoComplete
                    style={{ width: "100%", maxWidth: "300px" }}
                    // onSelect={onSelect}
                    // onSearch={onSearch}
                    placeholder="请输入分组"
                >
                    {options}
                </AutoComplete>
            )
        }
        await super.componentDidMount()
    }

    // 搜索
    renderSearchBar() {
        const { group, label, question_standard } = this.schema
        const filters = this.createFilters(
            {
                group: {
                    ...group,
                    type: schemaFieldType.Select,
                    renderInput: null,
                },
                label: {
                    ...label,
                    type: schemaFieldType.Select,
                    props: null,
                },
                question_standard: {
                    ...question_standard,
                    type: schemaFieldType.Input,
                },
            },
            5
        )
        return this.createSearchBar(filters)
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
                <Authorized
                    authority={this.meta.authority && this.meta.authority.add}
                    noMatch={null}
                >
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
                </Authorized>
                {this.meta.allowImport && (
                    <Authorized
                        authority={
                            this.meta.authority && this.meta.authority.export
                        }
                        noMatch={null}
                    >
                        <Button
                            onClick={() => {
                                this.setState({ visibleImport: true })
                            }}
                        >
                            导入
                        </Button>
                    </Authorized>
                )}
                {this.meta.allowExport && (
                    <Authorized
                        authority={
                            this.meta.authority && this.meta.authority.export
                        }
                        noMatch={null}
                    >
                        <Button
                            loading={this.state.exportLoading}
                            onClick={async () => {
                                this.setState(
                                    { exportLoading: true },
                                    async () => {
                                        let columns = this.getColumns(
                                            false
                                        ).filter((item) => {
                                            return (
                                                !item.isExpand &&
                                                item.key !== "external_id"
                                            )
                                        })
                                        // let data = this.state.data.list
                                        // if (this.props.exportMore) {
                                        let data = await this.requestList({
                                            pageSize: 1000000,
                                        })
                                        data = decorateList(
                                            data.list,
                                            this.schema
                                        )
                                        // }
                                        let hint = {}
                                        let external_id = {
                                            title: "编号",
                                            dataIndex: "external_id",
                                            key: "external_id",
                                        }
                                        let answer = {
                                            title: "答案",
                                            dataIndex: "answer",
                                            key: "answer",
                                        }
                                        let question_extend = {
                                            title: "扩展问",
                                            dataIndex: "question_extend",
                                            key: "question_extend",
                                        }
                                        let info = {
                                            title: "其他",
                                            dataIndex: "info",
                                            key: "info",
                                        }
                                        columns = [
                                            external_id,
                                            ...columns,
                                            answer,
                                            question_extend,
                                            info,
                                        ]
                                        await exportDataByTemplate(
                                            "导出数据",
                                            data,
                                            columns,
                                            this.meta.importTemplateUrl
                                        )
                                        this.setState({ exportLoading: false })
                                    }
                                )
                            }}
                        >
                            导出
                        </Button>
                    </Authorized>
                )}
            </>
        )
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({
                            showAnnex: true,
                            record: record,
                            attachment: clone(record.attachment),
                        })
                    }}
                >
                    附件
                </a>{" "}
            </>
        )
    }
    /**
     * 渲染信息弹出框
     * @param customProps 定制的属性
     * @returns {*}
     */
    renderInfoModal(customProps = {}) {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleModal, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleModal.bind(this),
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleAdd.bind(this),
        }

        return (
            visibleModal && (
                <InfoModal
                    renderForm={renderForm}
                    title={title}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
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

    handleUpload = async (file) => {
        this.setState({
            loadingAnnex: true,
        })
        let minioConfig = (await schemas.project.service.getMinioToken()).data

        var minioClient = new Minio.Client({
            endPoint: minioConfig.endpoint,
            port: parseInt(minioConfig.port),
            useSSL: minioConfig.secure,
            accessKey: minioConfig.AccessKeyId,
            secretKey: minioConfig.SecretAccessKey,
            sessionToken: minioConfig.SessionToken,
        })

        checkedAndUpload(
            "zknowninfo",
            file,
            minioClient,
            minioConfig,
            (res) => {
                // 输出url
                message.success(`文件上传成功`)
                // this.state.attachment.push(res)
                let attachment = []
                if (this.state.attachment)
                    attachment = clone(this.state.attachment)
                attachment.push(res)
                this.setState({
                    attachment,
                    loadingAnnex: false,
                })
            }
        )
        return false
    }

    renderExtend() {
        const props = {
            name: "file",
            // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: "authorization-text",
            },
            maxCount: 1,
            itemRender: () => {
                ;<></>
            },
            beforeUpload: (file) => {
                this.handleUpload(file)
                return false
            },
        }

        const footer = (
            <>
                <Row style={{ height: "32px", overflow: "hidden" }} gutter={24}>
                    <Col xl={16}>
                        <Upload {...props}>
                            <Button icon={<UploadOutlined />}>上传附件</Button>
                        </Upload>
                    </Col>
                    <Col xl={8}>
                        <Button
                            onClick={() => {
                                confirm({
                                    title: "提示",
                                    content: "关闭对话框将不会保留未确认内容！",
                                    okText: "关闭",
                                    cancelText: "取消",
                                    onOk: () => {
                                        this.setState({ showAnnex: false })
                                    },
                                    onCancel: () => {
                                        return
                                    },
                                })
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            onClick={async () => {
                                await this.service.patch(
                                    {
                                        id: this.state.record.id,
                                        attachment: this.state.attachment,
                                    },
                                    this.schema
                                )
                                message.success("修改成功！")
                                this.setState({
                                    showAnnex: false,
                                })
                                this.refreshList()
                            }}
                        >
                            确定
                        </Button>
                    </Col>
                </Row>
            </>
        )
        return (
            <>
                {this.state.showAnnex && (
                    <Modal
                        visible={this.state.showAnnex}
                        title={"附件管理"}
                        onCancel={() => {
                            confirm({
                                title: "提示",
                                content: "关闭对话框将不会保留未确认内容！",
                                okText: "关闭",
                                cancelText: "取消",
                                onOk: () => {
                                    this.setState({ showAnnex: false })
                                },
                                onCancel: () => {
                                    return
                                },
                            })
                        }}
                        footer={footer}
                    >
                        <Spin
                            spinning={this.state.loadingAnnex}
                            tip="文件上传中..."
                        >
                            <div>
                                <ul
                                    style={{
                                        margin: "25px 0 0",
                                        padding: "0",
                                        listStyle: "none",
                                    }}
                                >
                                    {this.state.attachment &&
                                        this.state.attachment.map(
                                            (item, index) => {
                                                let itemObj = item
                                                if (typeof item === "string")
                                                    itemObj = JSON.parse(item)
                                                return (
                                                    <li
                                                        key={itemObj.fileName}
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            marginTop: "16px",
                                                            zoom: 1,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-block",
                                                                width: "20px",
                                                                height: "20px",
                                                                marginTop:
                                                                    "1.5px",
                                                                marginRight:
                                                                    "16px",
                                                                fontWeight:
                                                                    "600",
                                                                fontSize:
                                                                    "12px",
                                                                lineHeight:
                                                                    "20px",
                                                                textAlign:
                                                                    "center",
                                                                // backgroundColor: @tag-default-bg;
                                                                borderRadius:
                                                                    "20px",
                                                                color: "#fff",
                                                                backgroundColor:
                                                                    "#314659",
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        <span
                                                            style={{
                                                                flex: 1,
                                                                marginRight:
                                                                    "8px",
                                                                overflow:
                                                                    "hidden",
                                                                whiteRpace:
                                                                    "nowrap",
                                                                textOverflow:
                                                                    "ellipsis",
                                                            }}
                                                            title={
                                                                itemObj.fileName
                                                            }
                                                        >
                                                            {itemObj.fileName}
                                                        </span>
                                                        <a
                                                            onClick={() => {
                                                                let attachment = this
                                                                    .state
                                                                    .attachment
                                                                attachment.splice(
                                                                    index,
                                                                    1
                                                                )
                                                                this.setState({
                                                                    attachment: clone(
                                                                        attachment
                                                                    ),
                                                                })
                                                            }}
                                                        >
                                                            <DeleteOutlined />
                                                        </a>
                                                    </li>
                                                )
                                            }
                                        )}
                                    {(!this.state.attachment ||
                                        !this.state.attachment.length) && (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )}
                                </ul>
                            </div>
                        </Spin>
                    </Modal>
                )}
            </>
        )
    }

    handleSearch = (fieldsValue) => {
        if (fieldsValue["label"] && fieldsValue["label"].length) {
            fieldsValue.label = "ov.{" + fieldsValue["label"] + "}"
        } else {
            fieldsValue.label = undefined
        }
        this.onSearch(fieldsValue)
    }

    handleVisibleImportModal = (flag, record, action) => {
        this.setState({
            visibleImport: !!flag,
            infoData: record,
            action,
        })
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
}

export default BaseList
