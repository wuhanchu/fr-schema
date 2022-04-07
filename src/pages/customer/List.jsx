import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Divider, message } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import { listToDict } from "@/outter/fr-schema/src/dict"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.customer.schema,
            service: schemas.customer.service,
            initLocalStorageDomainKey: true,
            operateWidth: "170px",
            search: {
                span: 6,
            },
            // readOnly: true,
            showEdit: false,
            showDelete: false,
            addHide: true,
        })
    }
    async handleAdd(data, schema) {
        // 更新
        // const {selectedRows} = this.state
        let response
        try {
            let args = {}
            args.number = this.state.infoData.telephone

            args.slot = {
                流程:
                    schemas.customer.callSchema.flow_key.dict[data.flow_key]
                        .name,
                域: this.props.dict.domain[this.state.localStorageDomainKey]
                    .name,
                name: this.state.infoData.name,
                gender: this.state.infoData.gender,
                email: this.state.infoData.email,
                ...(data.slot ? JSON.parse(data.slot) : {}),
            }

            response = await schemas.customer.service.call(args, schema)

            // this.refreshList()
            message.success("操作成功")
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    async componentDidMount() {
        let flow = await schemas.flow.service.get({
            limit: 1000,
            select: "id, key, domain_key, name",
        })
        schemas.customer.callSchema.flow_key.dict = listToDict(
            flow.list,
            "",
            "key",
            "name"
        )
        this.schema.domain_key.dict = this.props.dict.domain
        super.componentDidMount()
    }

    renderInfoModal(customProps = {}) {
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
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={schemas.customer.callSchema}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }
    renderOperateColumnExtend(record) {
        return (
            <>
                <a
                    onClick={() => {
                        this.handleVisibleModal(true, record, "add")
                    }}
                >
                    拨号
                </a>
            </>
        )
    }
}

export default List