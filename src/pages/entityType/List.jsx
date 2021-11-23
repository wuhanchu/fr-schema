import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { message, Modal, Divider, Button } from "antd"
import Attribute from "./Attribute"
import frSchema from "@/outter/fr-schema/src"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"

const { decorateList } = frSchema

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
            schema: schemas.entityType.schema,
            service: schemas.entityType.service,
            operateWidth: "180px",
            importTemplateUrl,
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    async handleAdd(data, schema) {
        // 更新
        let response
        if (!this.props.offline) {
            try {
                response = await this.service.post(data, schema)
                message.success("添加成功")
            } catch (error) {
                message.error(error.message)
            }
        } else {
            // 修改当前数据
            this.state.data.list.push(decorateItem(data, this.schema))
            this.setState({
                data: this.state.data,
            })
        }

        this.refreshList()
        this.handleVisibleModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }
    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, showAttr: true })
                    }}
                >
                    属性
                </a>
            </>
        )
    }
    renderExtend() {
        const { showAttr, record } = this.state
        return (
            <>
                {showAttr && (
                    <Modal
                        visible
                        onCancel={() => this.setState({ showAttr: false })}
                        title="属性"
                        footer={null}
                        width="80%"
                        maskClosable
                    >
                        <Attribute record={record} />
                    </Modal>
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

    handleUpdate = async (data, schema, method = "patch") => {
        // 更新
        if (this.state.infoData.key === data.key) {
            let response = await this.service[method](data, schema)
            this.refreshList()
            message.success("修改成功")
            this.handleVisibleModal()
            this.handleChangeCallback
            return response
        } else {
            Modal.confirm({
                title: "修改编码会导致大量数据不可用！",
                okText: "确认提交",
                onCancel: () => {
                    this.setState({
                        showConfirm: false,
                        showConfirmLoading: false,
                    })
                },
                cancelText: "取消",
                onOk: async () => {
                    let response = await this.service[method](data, schema)
                    this.refreshList()
                    message.success("修改成功")
                    this.handleVisibleModal()
                    this.handleChangeCallback
                    return response
                },
            })
        }
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
                    title: "正则表达式",
                    dataIndex: "regex",
                    key: "regex",
                },
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
            let keyArr = list.map((item) => item.key)
            let attribute = await schemas.entityAttr.service.get({
                limit: 10000,
                entity_type_key: "in.(" + keyArr.join(",") + ")",
            })
            list = list.map((item, index) => {
                let attributeArray = attribute.list
                    .filter(
                        (itemAttr) =>
                            item.key === itemAttr.entity_type_key &&
                            item.domain_key === itemAttr.domain_key
                    )
                    .map((item) => {
                        return {
                            ...item,
                            id: undefined,
                            create_time: undefined,
                        }
                    })
                attributeArray = attributeArray.length
                    ? JSON.stringify(attributeArray)
                    : ""
                return { ...item, attribute: attributeArray }
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
                    domain_key: {
                        title: "域",
                        // required: true,
                        type: "Select",
                        dict: this.props.dict.domain,
                    },
                    name: {
                        title: "名称",
                        rules: (rule, value) => value,
                        required: true,
                    },
                    key: {
                        title: "编码",
                        rules: (rule, value) => value,
                        required: true,
                    },
                    regex: {
                        title: "正则表达式",
                    },
                    remark: {
                        title: "备注",
                    },
                    attribute: {
                        title: "属性",
                    },
                }}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    let attributeAttr = []
                    const data = this.state.importData.map((item) => {
                        const { attribute, ...others } = item
                        let attributeArr = attribute
                            ? JSON.parse(attribute)
                            : []
                        attributeAttr = [...attributeAttr, ...attributeArr]
                        return {
                            ...this.meta.addArgs,
                            ...others,
                        }
                    })
                    // let postData = data.filters
                    await this.service.upInsert(data)
                    await schemas.entityAttr.service.upInsert(attributeAttr)
                    message.success("导入成功")
                    this.setState({ visibleImport: false })
                    this.refreshList()
                }}
            />
        )
    }

    renderSearchBar() {
        const { name, key, regex, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
                key,
                regex,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
