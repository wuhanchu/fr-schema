import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import Relation from "./List"
import RelationType from "../relationType/List"

// 微信信息类型
export const infoType = {
    relation: "实体关系",
    relationType: "实体关系类型",
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
            query && query.type ? query.type : infoType.relation
        this.state = {
            tabActiveKey,
        }
    }

    render() {
        const { tabActiveKey } = this.state

        return (
            <PageHeaderWrapper
                title="实体关系"
                tabList={Object.keys(infoType).map((key) => ({
                    key: infoType[key],
                    tab: infoType[key],
                }))}
                onTabChange={(tabKey) =>
                    this.setState({ tabActiveKey: tabKey })
                }
                tabActiveKey={tabActiveKey}
            >
                {tabActiveKey === infoType.relation && <Relation />}
                {tabActiveKey === infoType.relationType && <RelationType />}
            </PageHeaderWrapper>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
