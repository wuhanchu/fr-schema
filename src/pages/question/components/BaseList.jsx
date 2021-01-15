import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import schemas from "@/schemas"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"

import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import React from "react"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import * as _ from "lodash"
import clone from "clone"

@Form.create()
class BaseList extends DataList {
    constructor(props) {
        const importTemplateUrl = (
            BASE_PATH + "/import/掌数_知料_知识库信息导入.xlsx"
        ).replace("//", "/")
        super(props, {
            operateWidth: 100,
            schema: clone(schemas.question.schema),
            service: schemas.question.service,
            allowExport: true,
            showSelect: true,
            allowImport: true,
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
                    width={"900px"}
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
