import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import schemas from "@/schemas"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
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
} from "antd"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import React from "react"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import * as _ from "lodash"
import clone from "clone"
import styles from "./style.less"
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons"
import { checkedAndUpload } from "@/utils/minio"

const confirm = Modal.confirm

@Form.create()
class BaseList extends DataList {
    constructor(props) {
        const importTemplateUrl = (
            BASE_PATH + "/import/掌数_知料_知识库信息导入.xlsx"
        ).replace("//", "/")
        super(props, {
            operateWidth: 150,
            schema: clone(schemas.question.schema),
            service: schemas.question.service,
            allowExport: true,
            showSelect: true,
            allowImport: true,
            infoProps: {
                offline: true,
                colNum: 2,
                width: "1000px",
            },
            importTemplateUrl,
        })
    }

    async componentDidMount() {
        const response = await this.service.get({
            ...this.meta.queryArgs,
            select: "label",
            limit: 9999,
        })

        let labelDictList = {}
        console.log(response)
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
        })
        this.setState({
            attachment: [],
            loadingAnnex: false,
        })
        console.log(labelDictList)
        this.schema.label.dict = labelDictList
        await super.componentDidMount()
    }

    // 搜索
    renderSearchBar() {
        const { group, label, question_standard } = this.schema
        const filters = this.createFilters(
            {
                group,
                label: {
                    ...label,
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
        const { form } = this.props
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
                    width={"820px"}
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
            beforeUpload: (file, props, data) => {
                this.setState({
                    loadingAnnex: true,
                })
                checkedAndUpload("zknowninfo", file, (res) => {
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
                })
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
                                await this.service.patch({
                                    id: this.state.record.id,
                                    attachment: this.state.attachment,
                                })
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
                            <div className={styles.salesRank}>
                                <ul className={styles.rankingList}>
                                    {this.state.attachment &&
                                        this.state.attachment.map(
                                            (item, index) => {
                                                let itemObj = item
                                                if (typeof item === "string")
                                                    itemObj = JSON.parse(item)
                                                return (
                                                    <li key={itemObj.fileName}>
                                                        <span
                                                            className={`${
                                                                styles.rankingItemNumber
                                                            } ${
                                                                index < 3
                                                                    ? styles.active
                                                                    : ""
                                                            }`}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.rankingItemTitle
                                                            }
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
        console.log(fieldsValue["label"])
        if (fieldsValue["label"].length) {
            fieldsValue.label = "ov.{" + fieldsValue["label"] + "}"
        } else {
            fieldsValue.label = undefined
        }
        this.onSearch(fieldsValue)
        // e.preventDefault()
    }
    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={schemas.question.schema}
                errorKey={"question_standard"}
                sliceNum={4}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    const data = this.state.importData.map((item) => {
                        const { label, question_extend, ...others } = item
                        let question_extend_data = question_extend
                        if (question_extend instanceof String) {
                            question_extend_data = [question_extend]
                        }

                        return {
                            ...this.meta.addArgs,
                            label: label && label.split("|"),
                            question_extend: question_extend_data,
                            ...others,
                        }
                    })
                    await this.service.upInsert(data)
                    this.setState({ visibleImport: false })
                    this.refreshList()
                }}
            />
        )
    }
}

export default BaseList
