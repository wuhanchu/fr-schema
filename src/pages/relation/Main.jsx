import ListPage from "@/components/ListPage/ListPage"
import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import Relation from "./List"
import RelationType from "../relationType/List"
import { Dropdown, Menu, Button } from "antd"

// 微信信息类型
export const infoType = {
    relation: "关系",
    relationType: "类型",
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
        const localStorageDomainKey = localStorage.getItem("domain_key")
        super(props)
        const { query } = this.props.location
        const tabActiveKey =
            query && query.type ? query.type : infoType.relation
        this.state = {
            tabActiveKey,
            localStorageDomainKey,
        }
    }
    handleDomainChange = (item) => {
        let otherTabActiveKey = this.state.tabActiveKey
        this.setState({
            localStorageDomainKey: item.key,
        })
    }

    render() {
        const { tabActiveKey } = this.state
        const { dict, data } = this.props
        let domain = []
        if (dict) {
            Object.keys(dict.domain).forEach((key) => {
                domain.push(dict.domain[key])
            })
        }
        const menu = (
            <Menu
                onClick={async (item) => {
                    console.log(item)
                    localStorage.setItem("domain_key", item.key)
                    this.setState({
                        localStorageDomainKey: item.key,
                    })
                    this.handleDomainChange(item)
                }}
            >
                {domain &&
                    domain.map((item) => {
                        return (
                            <Menu.Item key={item.key}>
                                <a>{item.name}</a>
                            </Menu.Item>
                        )
                    })}
            </Menu>
        )
        const operations = (
            <Dropdown overlay={menu} placement="bottomLeft">
                <Button style={{ top: "-35px", float: "right" }}>
                    {(this.state.localStorageDomainKey &&
                        dict &&
                        dict.domain[this.state.localStorageDomainKey].name) ||
                        "选择数据域"}
                </Button>
            </Dropdown>
        )
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
                extra={operations}
            >
                {tabActiveKey === infoType.relation && (
                    <Relation domain_key={this.state.localStorageDomainKey} />
                )}
                {tabActiveKey === infoType.relationType && (
                    <RelationType
                        domain_key={this.state.localStorageDomainKey}
                    />
                )}
            </PageHeaderWrapper>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
