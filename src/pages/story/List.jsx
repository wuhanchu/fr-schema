import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Divider } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import YamlEdit from "./yamlEdiit"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.story.schema,
            service: schemas.story.service,
            operateWidth: "170px",
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

    handleSetYamlEditVisible = (visible) => {
        this.setState({
            showYamlEdit: visible,
        })
    }

    renderExtend() {
        return (
            <>
                {this.state.showYamlEdit && (
                    <YamlEdit
                        handleSetYamlEditVisible={this.handleSetYamlEditVisible}
                        service={this.service}
                        title={"内容"}
                        refreshList={this.refreshList.bind(this)}
                        schemasName={"content"}
                        record={this.state.record}
                    />
                )}
            </>
        )
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({
                            showYamlEdit: true,
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
