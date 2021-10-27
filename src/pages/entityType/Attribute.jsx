import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { message } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.entityAttr.schema,
            service: schemas.entityAttr.service,
            // infoProps: {
            //     width: "900px",
            // },
            queryArgs: {
                ...props.queryArgs,
                entity_type_key: props.record.key,
            },
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
                    { ...data, entity_type_key: this.props.record.key },
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
