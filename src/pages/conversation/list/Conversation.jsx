import {connect} from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas/conversation/list"
import React, {Fragment} from "react"
import "@ant-design/compatible/assets/index.css"
import {
    Modal,
} from 'antd';
import WorkDetail from "@/pages/outPage/WorkDetail";
import flowSchemas from '@/schemas/flow/index';
import frSchema from "@/outter/fr-schema/src";
const { utils } = frSchema

@connect(({global}) => ({
    dict: global.dict,
}))
class Conversation extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.schema,
            service: schemas.service,
            operateWidth: "170px",
            showEdit: false,
            showDelete: false,
        })
        this.state = {
            ...this.state,
            showDetail: false,
            detail: {},
        }
    }

    async componentDidMount() {
        super.componentDidMount()
        this.schema.domain_key.dict = this.props.dict.domain
        this.findFlowList()
    }

    /**
     * 表格操作列，扩展方法
     */
    renderOperateColumnExtend(record) {
        return (
            <Fragment>
                <a onClick={() => this.showDetail(record)}>
                    详情
                </a>
            </Fragment>
        )
    }

    /**
     * 列表扩展
     */
    renderExtend() {
        return (
            <>
                {this.renderDetailModal()}
            </>
        )
    }

    // 详情弹窗
    renderDetailModal() {
        let {showDetail, detail} = this.state;
        return (
            <Modal
                visible={showDetail}
                title="会话详情"
                onCancel={_ => this.setState({showDetail: false})}
                footer={null}
                width="50%"
                destroyOnClose
            >
                <WorkDetail conversation_id={detail.id} roomHeight="60vh"/>
            </Modal>
        )
    }

    // 显示详情
    showDetail(record) {
        this.setState({showDetail: true, detail: {...record}})
    }

    // 流程列表-> 列表枚举展示
    async findFlowList() {
        let res = await flowSchemas.service.get({pageSize: 10000})
        this.schema.flow_key.dict = utils.dict.listToDict(
            res.list,
            null,
            "key",
            "name"
        )
    }
}

export default Conversation
