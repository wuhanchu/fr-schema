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
            schema: schemas.domain.schema,
            service: schemas.domain.service,
            infoProps: {
                offline: true,
                width: "1100px",
                isCustomize: true,
                customize: {
                    left: 12,
                    right: 12,
                },
            },
        })
    }
    renderSearchBar() {
        const { name } = this.schema
        const filters = this.createFilters(
            {
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
