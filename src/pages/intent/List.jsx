import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Divider, Card, Modal } from 'antd'
// import WordModel from "@/outter/gg-editor/WordModel"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.intent.schema,
            service: schemas.intent.service,
            infoProps: {
                width: "900px",
            },
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    // renderOperateColumnExtend(record) {
    //     return (
    //         <>
    //             <Divider type="vertical" />
    //             <a
    //                 onClick={() => {
    //                     this.setState({ record, visibleFlow: true })
    //                 }}
    //             >
    //                 测试流程
    //             </a>
    //         </>
    //     )
    // }

    // renderExtend () {
    //     const { visibleFlow, record } = this.state
    //     return <>
    //             {visibleFlow && <Modal
    //                     title={null}
    //                     visible={true}
    //                     width={"90%"}
    //                     style={{ top: 20 }}
    //                     footer={null}
    //                     onOk={() => {
    //                         this.setState({ visibleFlow: false })
    //                     }}
    //                     onCancel={() => {
    //                         this.setState({ visibleFlow: false })
    //                     }}
    //                     closable={false}
    //                 >
    //                  <WordModel
    //                     visibleRelease={this.state.visibleFlow}
    //                     record={record} 
    //                     />  
    //                 </Modal>}
    //     </>
    // }

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
