import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.entity.schema,
            service: schemas.entity.service,
        })
    }

    async componentDidMount() {
        const res = await schemas.entityType.service.get({ pageSize: 10000 })
        let typeList = utils.dict.listToDict(res.list, null, "key", "name")
        this.schema.domain_key.dict = this.props.dict.domain
        this.schema.type_key.dict = typeList
        super.componentDidMount()
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
