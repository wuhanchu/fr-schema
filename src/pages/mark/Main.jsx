import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import Add from "./Add"
import Complement from "./Complement"

// 微信信息类型
export const infoType = {
    Complement: "补充扩展问",
    Add: "问题新增",
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
        const tabActiveKey =
            query && query.type ? query.type : infoType.Complement
        this.state = {
            tabActiveKey,
        }
    }

    render() {
        const { tabActiveKey } = this.state

        return (
            <PageHeaderWrapper
                title="标注"
                tabList={Object.keys(infoType).map((key) => ({
                    key: infoType[key],
                    tab: infoType[key],
                }))}
                onTabChange={(tabKey) =>
                    this.setState({ tabActiveKey: tabKey })
                }
                tabActiveKey={tabActiveKey}
            >
                {tabActiveKey === infoType.Complement && <Complement />}
                {tabActiveKey === infoType.Add && <Add />}
            </PageHeaderWrapper>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
