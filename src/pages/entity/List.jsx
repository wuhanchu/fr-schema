import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Select } from "antd"
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
            schema: schemas.entity.schema,
            service: schemas.entity.service,
            infoProps: {
                width: "900px",
            },
            operateWidth: "120px",
        })
    }

    async componentDidMount() {
        const res = await schemas.entityType.service.get({ pageSize: 10000 })
        let typeList = utils.dict.listToDict(res.list, null, "key", "name")
        this.schema.domain_key.dict = this.props.dict.domain
        this.schema.type_key.props = {}
        this.schema.type_key.props.typeKeyArry = res.list
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
                options = props.typeKeyArry
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
