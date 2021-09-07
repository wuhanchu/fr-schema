import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Divider, Modal } from "antd"
import frSchema from "@/outter/fr-schema/src"
import ChartModal from "@/pages/kingFlow/KingFlow"

const { decorateList } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
    data: global.data,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        const importTemplateUrl = (BASE_PATH + "/import/意图.xlsx").replace(
            "//",
            "/"
        )
        super(props, {
            schema: schemas.flow.schema,
            service: schemas.flow.service,
            importTemplateUrl,
            operateWidth: "170px",
        })
        this.schema.domain_key.dict = this.props.dict.domain
        console.log(props)
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        window.__isReactDndBackendSetUp = undefined
                        this.setState({ record, visibleFlow: true })
                    }}
                >
                    编辑流程
                </a>
            </>
        )
    }

    renderExtend() {
        const { visibleFlow, record } = this.state
        return (
            <>
                <Modal
                    title={"流程配置"}
                    visible={visibleFlow}
                    width={"90%"}
                    style={{ top: 20, bottom: 20 }}
                    footer={null}
                    destroyOnClose={true}
                    onOk={() => {
                        console.log(window.__isReactDndBackendSetUp)
                        this.setState({ visibleFlow: false })
                    }}
                    onCancel={() => {
                        this.setState({ visibleFlow: false })
                    }}
                    closable={false}
                >
                    <ChartModal
                        visibleRelease={false}
                        record={record}
                        handleSetVisibleFlow={(args) => {
                            this.setState({ visibleFlow: args })
                            this.refreshList()
                        }}
                        dict={this.props.data}
                        schemas={schemas.flow}
                        service={this.service}
                    />
                </Modal>
            </>
        )
    }
    // 搜索
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
}

export default List
