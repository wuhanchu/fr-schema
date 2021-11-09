import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import { Button, Menu, Dropdown, message } from "antd"
import Add from "./Add"
import Complement from "./Complement"
import schemas from "@/schemas"
import { LoadingOutlined } from "@ant-design/icons"

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

    async componentDidMount() {
        let data = await schemas.domain.service.get({ limit: 10000 })
        this.setState({ domian: data.list })
    }

    render() {
        const { tabActiveKey, domian } = this.state
        const menu = (
            <Menu
                onClick={async (item) => {
                    try {
                        this.setState({ isLoading: true })
                        let data = await schemas.mark.service.mark_task({
                            domain_key: item.key,
                        })
                        this.setState({ isLoading: false })
                        message.success(data.message)
                    } catch (error) {
                        message.error(error.message)
                        this.setState({ isLoading: false })
                    }
                }}
            >
                {domian &&
                    domian.map((item) => {
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
                <Button>
                    {this.state.isLoading && <LoadingOutlined />}创建分析
                </Button>
            </Dropdown>
        )
        return (
            <PageHeaderWrapper
                title="问题库运维"
                tabBarExtraContent={operations}
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
