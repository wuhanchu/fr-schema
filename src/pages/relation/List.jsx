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
            schema: schemas.relation.schema,
            service: schemas.relation.service,
            // readOnly: true,
            infoProps: {
                // width: "900px",
                offline: true,
            },
        })
    }

    async componentDidMount() {
        let res = await schemas.entity.service.get({ pageSize: 10000 })
        let typeList = utils.dict.listToDict(res.list, null, "id", "name")
        res = await schemas.relationType.service.get({ pageSize: 10000 })
        let relationTypeList = utils.dict.listToDict(
            res.list,
            null,
            "key",
            "name"
        )
        this.schema.domain_key.dict = this.props.dict.domain
        this.schema.from_entity_id.dict = typeList
        this.schema.to_entity_id.dict = typeList
        this.schema.relation_key.dict = relationTypeList
        super.componentDidMount()
    }

    renderSearchBar() {
        const { type, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                type,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
