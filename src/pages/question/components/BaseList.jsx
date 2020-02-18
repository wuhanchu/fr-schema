import { Form } from "antd"
import schemas from "@/schemas"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import ImportModal from "@/pages/question/components/ImportModal"
import React from "react"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import * as _ from "lodash"

@Form.create()
class BaseList extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.question.schema,
            service: schemas.question.service,
            allowExport: true,
            allowImport: true,
            importTemplateUrl:
                BASE_PATH + "import/掌数_知料_知识库信息导入.xlsx"
        })
    }

    async componentDidMount() {
        const response = await this.service.get({
            ...this.meta.queryArgs,
            select: "label",
            limit: 9999
        })

        let labelDictList = {}
        response.list.forEach(item => {
            if (!_.isNil(item.label)) {
                item.label.forEach(value => {
                    labelDictList[value] = {
                        value: value,
                        remark: value
                    }
                })
            }
        })

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
                    props: {
                        mode: "multiple"
                    }
                },
                question_standard: {
                    ...question_standard,
                    type: schemaFieldType.Input
                }
            },
            5
        )
        return this.createSearchBar(filters)
    }

    /**
     * 处理搜索触发事件
     * @param e
     */
    handleSearch = e => {
        e.preventDefault()

        const { form } = this.props
        form.validateFields((err, fieldsValue) => {
            if (err) return
            const allValues = form.getFieldsValue()
            const values = {
                ...allValues,
                updatedAt:
                    fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf()
            }

            this.setState({
                formValues: values
            })

            // refresh the list
            const formValues = {}
            Object.keys(values).forEach(key => {
                if (_.isNil(values[key])) {
                    return
                }

                switch (key) {
                    case "label":
                        formValues[key] = "ov.{" + values[key] + "}"
                        break
                    case "question_standard":
                        formValues[key] = "like.%" + values[key] + "%"
                        break
                    case "group":
                        formValues[key] = "like.%" + values[key] + "%"
                        break
                    default:
                        formValues[key] = values[key]
                }
            })

            this.setState(
                {
                    pagination: null,
                    formValues
                },
                async () => {
                    this.refreshList()
                }
            )
        })
    }

    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={this.schema}
                errorKey={"question_standard"}
                sliceNum={3}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={data => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    const data = this.state.importData.map(item => {
                        const { label, question_extend, ...others } = item
                        let question_extend_data = question_extend
                        if (question_extend instanceof String) {
                            question_extend_data = [question_extend]
                        }

                        return {
                            ...this.meta.addArgs,
                            label: label.split("|"),
                            question_extend: question_extend_data,
                            ...others
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
