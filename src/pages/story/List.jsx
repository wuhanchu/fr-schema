import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.story.schema,
            service: schemas.story.service,
        })
    }

    async componentDidMount() {
        super.componentDidMount()
        this.schema.domain_key.dict = this.props.dict.domain
    }
    renderSearchBar() {
        const { name, domain_key } = this.schema
        const filters = this.createFilters(
            {
                name,
                domain_key,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
