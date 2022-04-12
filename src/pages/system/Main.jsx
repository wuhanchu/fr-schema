import React from "react"
import { connect } from "dva"
import DictType from "./components/DictType"
import Dict from "./components/Dict"
import TabMulList from "@/pages/tabList/TabMulList";
import {Tabs} from "antd";
const {TabPane} = Tabs;

// 微信信息类型
export const infoType = {
    Dict: "字典",
    DictType: "字典类型",
}

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
            tabActiveKey: infoType.Dict,
            needListener:false,
        }
    }

    renderTab() {
        const { tabActiveKey } = this.state
        return (
            <Tabs
                onChange={(tabKey) =>
                    this.setState({ tabActiveKey: tabKey })
                }
                activeKey={tabActiveKey}
            >
                <TabPane tab="字典" key={infoType.Dict}>
                    <Dict />
                </TabPane>
                <TabPane tab="字典类型" key={infoType.DictType}>
                    <DictType />
                </TabPane>
            </Tabs>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
