import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        console.log(props)
        super(props, {
            schema: schemas.hotWord.schema,
            service: schemas.hotWord.service,
            mini: true,
            infoProps: {
                width: "900px",
            },
            showEdit: false,
            showDelete: false,
            readOnly: true,
            addHide: true,
            queryArgs: {
                ...props.queryArgs,
                domain_key: props.record.key,
                limit: 10,
            },
        })
    }

    async componentDidMount() {
        let project = await schemas.project.service.get({
            limit: 10000,
            domain_key: this.props.record.key,
        })
        this.schema.project_id.dict = listToDict(project.list)
        super.componentDidMount()
    }

    renderSearchBar() {
        const { begin_time, end_time, project_id } = this.schema
        const filters = this.createFilters(
            {
                begin_time,
                end_time,
                project_id,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
