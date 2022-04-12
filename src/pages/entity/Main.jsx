import React from "react"
import { connect } from "dva"
import Entity from "./List"
import EntityType from "../entityType/List"
import TabMulList from "@/pages/tabList/TabMulList";
import {Tabs} from 'antd';
const {TabPane} = Tabs;
// 微信信息类型
export const infoType = {
    entity: "信息",
    entityType: "类型",
}

/**
 * 实体信息
 * meta 包含
 * resource
 * service
 * title
 * selectedRows
 * scroll table whether can scroll
 */
class Main extends TabMulList {
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
            tabActiveKey: infoType.entity,
        }
    }

    renderTab() {
        const { tabActiveKey, localStorageDomainKey } = this.state
        return (
            <Tabs
                onChange={(tabKey) =>
                    this.setState({ tabActiveKey: tabKey })
                }
                activeKey={tabActiveKey}
            >
                <TabPane tab={"信息"} key={infoType.entity}>
                    <Entity domain_key={localStorageDomainKey} />
                </TabPane>
                <TabPane tab={"类型"} key={infoType.entityType}>
                    <EntityType domain_key={localStorageDomainKey} />
                </TabPane>
            </Tabs>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
