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
            schema: schemas.response.schema,
            service: schemas.response.service,
            operateWidth: "120px",
            infoProps: {
                width: "900px",
            },
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    renderSearchBar() {
        const { name, key, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
                key,
                // standard_text,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
