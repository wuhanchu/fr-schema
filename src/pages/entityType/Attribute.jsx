import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { message, Button } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"

import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"

const { utils, decorateList } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        const importTemplateUrl = (
            BASE_PATH + "../import/实体属性.xlsx"
        ).replace("//", "/")
        super(props, {
            schema: schemas.entityAttr.schema,
            service: schemas.entityAttr.service,
            queryArgs: {
                ...props.queryArgs,
                entity_type_key: props.record.key,
                domain_key: props.record.domain_key,
            },
            showDelete: true,
            showSelect: true,
            importTemplateUrl,
            operateWidth: "120px",
        })
    }

    async componentDidMount() {
        this.schema.domain_key.dict = this.props.dict.domain
        super.componentDidMount()
    }

    async handleAdd(data, schema) {
        // 更新
        let response
        if (!this.props.offline) {
            try {
                response = await this.service.post(
                    {
                        ...data,
                        entity_type_key: this.props.record.key,
                        domain_key: this.props.record.domain_key,
                        alias: data.alias ? "true" : "false",
                    },
                    schema
                )
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

    handleUpdate = async (data, schema, method = "patch") => {
        // 更新
        let response
        try {
            if (!this.props.offline) {
                response = await this.service[method](
                    { ...data, alias: data.alias ? "true" : "false" },
                    schema
                )
            }

            // 修改当前数据
            this.refreshList()
            message.success("修改成功")
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }

        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
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
                return (
                    !item.isExpand &&
                    item.key !== "external_id" &&
                    item.key != "create_time"
                )
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
            await exportData("实体属性", data, columns)
            this.setState({ exportLoading: false })
        })
    }

    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={{
                    ...this.schema,
                    domain_key: {
                        title: "域",
                        // required: true,
                        type: "Select",
                        dict: this.props.dict.domain,
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
                        return {
                            ...item,
                            entity_type_key: this.props.record.key,
                        }
                    })
                    console.log(data)
                    await this.service.upInsert(data)
                    message.success("导入成功")
                    this.setState({ visibleImport: false })
                    this.refreshList()
                }}
            />
        )
    }

    renderSearchBar() {
        const { name, type_key, domain_key } = this.schema
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
