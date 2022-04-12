import React from "react"
import { connect } from "dva"
import Relation from "./List"
import RelationType from "../relationType/List"
import { Tabs} from "antd"
import TabMulList from "@/pages/tabList/TabMulList";

// 微信信息类型
export const infoType = {
    relation: "关系",
    relationType: "类型",
}
const {TabPane} = Tabs;
/**
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
            tabActiveKey: infoType.List,
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
                <TabPane tab={"关系"} key={infoType.relation}>
                    <Relation domain_key={localStorageDomainKey} />
                </TabPane>
                <TabPane tab={"类型"} key={infoType.relationType}>
                    <RelationType
                        domain_key={localStorageDomainKey}
                    />
                </TabPane>
            </Tabs>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
