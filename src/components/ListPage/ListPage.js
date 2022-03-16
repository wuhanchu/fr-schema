import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import { default as tempDataList } from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import { Dropdown, Menu, Button } from "antd"
export const DataList = tempDataList

/**
 * meta 包含
 * resource
 * service
 * title
 * selectedRows
 * scroll table whether can scroll
 */
class ListPage extends DataList {
    constructor(props, meta) {
        if (!localStorage.getItem("domain_key")) {
            localStorage.setItem("domain_key", "default")
        }
        const localStorageDomainKey = localStorage.getItem("domain_key")
        super(props, {
            queryArgs: {
                domain_key: meta.initLocalStorageDomainKey
                    ? localStorageDomainKey || undefined
                    : undefined,
            },
            ...meta,
        })
        this.state = { ...this.state, localStorageDomainKey }
        this.meta = { ...(this.meta || {}), ...this.props.meta }
    }

    renderDataList() {
        return super.render()
    }

    handleDomainChange = (item) => {
        if (this.meta.initLocalStorageDomainKey) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: item.key,
            }
            console.log(this.props, this.meta)
            this.refreshList()
        }
    }

    render() {
        const { title, content, tabList, onTabChange } = this.meta
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
                title={title && title + "列表"}
                content={
                    content ||
                    (this.renderHeaderContent && this.renderHeaderContent())
                }
                title={false}
                // tabList={tabList}
                onTabChange={onTabChange}
                tabActiveKey={tabActiveKey}
                extra={operations}
            >
                {this.renderDataList()}
            </PageHeaderWrapper>
        )
    }
}

export default ListPage
