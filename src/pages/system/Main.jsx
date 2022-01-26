import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import DictType from "./components/DictType"
import Dict from "./components/Dict"

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
class Main extends React.PureComponent {
    constructor(props) {
        super(props)
        const { query } = this.props.location
        const tabActiveKey = query && query.type ? query.type : infoType.Dict
        this.state = {
            tabActiveKey,
        }
    }

    render() {
        const { tabActiveKey } = this.state

        return (
            <PageHeaderWrapper
                title={false}
                tabList={Object.keys(infoType).map((key) => ({
                    key: infoType[key],
                    tab: infoType[key],
                }))}
                onTabChange={(tabKey) =>
                    this.setState({ tabActiveKey: tabKey })
                }
                tabActiveKey={tabActiveKey}
            >
                {tabActiveKey === infoType.Dict && <Dict />}
                {tabActiveKey === infoType.DictType && <DictType />}
            </PageHeaderWrapper>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
