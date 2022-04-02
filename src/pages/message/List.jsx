import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Divider } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.message.schema,
            service: schemas.message.service,
            initLocalStorageDomainKey: true,
            operateWidth: "170px",
            search: {
                span: 6,
            },
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
                domain_key,
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }

    renderExtend() {
        return <></>
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({
                            // showYamlEdit: true,
                            record,
                        })
                    }}
                >
                    内容
                </a>
            </>
        )
    }
}

export default List
