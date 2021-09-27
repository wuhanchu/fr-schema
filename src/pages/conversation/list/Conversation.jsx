import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas/conversation/list"
import React, { Fragment } from "react"
import "@ant-design/compatible/assets/index.css"
import { Modal } from "antd"
import ConversationDetail from "@/pages/outPage/ConversationDetail"
import flowSchemas from "@/schemas/flow/index"
import userService from "@/pages/authority/user/service"
import frSchema from "@/outter/fr-schema/src"
const { utils } = frSchema

@connect(({ global }) => ({
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
            addHide: true,
            queryArgs: {
                order: 'create_time.desc'
            }
        })
        this.state = {
            ...this.state,
            showDetail: false,
            detail: {},
            showIntentFlow: true,
        }
    }

    async componentDidMount() {
        let {location}  =this.props;
        // 外链
        if (location.pathname.startsWith('/outter')) {
            let showIntentFlow = location.query && location.query.showIntentFlow && location.query.showIntentFlow === 'true';
            this.setState({showIntentFlow})
        }
        this.schema.domain_key.dict = this.props.dict.domain
        await this.findFlowList()
        await this.findUserList()
        super.componentDidMount()
    }

    // 搜索
    renderSearchBar() {
        const { domain_key, flow_key, status } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                flow_key,
                status,
            },
            5
        )
        return this.createSearchBar(filters)
    }

    /**
     * 表格操作列，扩展方法
     */
    renderOperateColumnExtend(record) {
        return (
            <Fragment>
                <a onClick={() => this.showDetail(record)}>详情</a>
            </Fragment>
        )
    }

    /**
     * 列表扩展
     */
    renderExtend() {
        return <>{this.renderDetailModal()}</>
    }

    // 详情弹窗
    renderDetailModal() {
        let { showDetail, detail, showIntentFlow } = this.state
        return (
            <Modal
                visible={showDetail}
                title="会话详情"
                onCancel={(_) => this.setState({ showDetail: false })}
                footer={null}
                width="90%"
                destroyOnClose
            >
                <ConversationDetail
                    conversation_id={detail.id}
                    flow_key={detail.flow_key}
                    domain_key={detail.domain_key}
                    roomHeight="60vh"
                    showIntentFlow={showIntentFlow}
                />
            </Modal>
        )
    }

    // 显示详情
    showDetail(record) {
        this.setState({ showDetail: true, detail: { ...record } })
    }

    // 流程列表-> 列表枚举展示
    async findFlowList() {
        let res = await flowSchemas.service.get({ pageSize: 10000 })
        this.schema.flow_key.dict = utils.dict.listToDict(
            res.list,
            null,
            "key",
            "name"
        )
    }

    // 流程列表-> 列表枚举展示
    async findUserList() {
        let res = await userService.get({ pageSize: 10000 })
        this.schema.user_id.dict = utils.dict.listToDict(
            res.list,
            null,
            "id",
            "name"
        )
    }
}

export default Conversation
