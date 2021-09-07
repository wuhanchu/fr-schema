import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import { verifyJson } from "@/outter/fr-schema-antd-utils/src/utils/component"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.synonym.schema,
            service: schemas.synonym.service,
            operateWidth: "100px",
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    renderContentModal() {
        const { id } = this.schema
        const { record } = this.state
        const content = {
            title: "内容",
            props: {
                style: { width: "500px" },
                height: "400px",
            },
            type: schemaFieldType.AceEditor,
            decoratorProps: { rules: verifyJson },
        }
        return (
            this.state.showContentModal && (
                <InfoModal
                    title="如果当前数据异常，请填写备注，跳过当前数据！"
                    action={actions.edit}
                    handleUpdate={async (values) => {
                        try {
                            const res = await this.service.patch({
                                id: record.id,
                                label: values.label,
                                operation: "error",
                                remark: values.remark,
                            })
                            message.success(res.message)
                            this.refreshList()
                            this.setState({ showContentModal: false })
                        } catch (e) {
                            message.error(e.message)
                        }
                    }}
                    values={record}
                    visible
                    onCancel={() => this.setState({ showContentModal: false })}
                    schema={{
                        id,
                        content,
                    }}
                />
            )
        )
    }

    renderExtend() {
        return <>{this.renderContentModal()}</>
    }

    renderSearchBar() {
        const { standard_text, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                standard_text,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
