import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import {
    Button,
    Menu,
    Dropdown,
    message,
    notification,
    Progress,
    Tooltip,
    Steps,
} from "antd"
import Add from "./Add"
import Complement from "./Complement"
import Repeat from "./Repeat"
import schemas from "@/schemas"
import {
    LoadingOutlined,
    QuestionCircleOutlined,
    SyncOutlined,
} from "@ant-design/icons"

const { Step } = Steps

// 微信信息类型
export const infoType = {
    Complement: "补充扩展问",
    Add: "问题新增",
    // Repeat: "重复问题",
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

    handleTaskInfo = async (record, taskId) => {
        let args = {
            message: "请稍等！",
            key: "info",
            description: "查询任务详情中",
            duration: 0,
        }
        notification.open(args)
        let res = await schemas.task.service.getTaskInfo({
            domain_key: record.key,
            task_id: taskId,
            order: "create_time.asc",
        })
        if (res.list.length) {
            let mySteps = (
                <Steps
                    direction="vertical"
                    progressDot
                    current={res.list.length}
                >
                    {res.list.map((item) => {
                        return <Step title={item.name} />
                    })}
                </Steps>
            )
            args = {
                message: (
                    <span>
                        <span>"任务详情！"</span>
                        <Tooltip title="刷新">
                            <a
                                onClick={() => {
                                    this.handleTaskInfo(record, taskId)
                                }}
                            >
                                <SyncOutlined style={{ marginLeft: "5px" }} />
                            </a>
                        </Tooltip>
                    </span>
                ),
                key: "info",
                description: mySteps,
                duration: 10,
            }
            notification.open(args)
        } else {
            let args = {
                message: "暂无数据",
                key: "info",
                description: "请稍后查询",
                duration: 0,
            }
            notification.open(args)
        }
    }

    render() {
        const { tabActiveKey, domian } = this.state
        const menu = (
            <Menu
                onClick={async (item) => {
                    try {
                        this.setState({ isLoading: true })
                        let sync = await schemas.mark.service.mark_task({
                            domain_key: item.key,
                        })
                        this.setState({ isLoading: false })
                        message.success(sync.message)
                        this.mysetInterval = setInterval(async () => {
                            let data
                            try {
                                data = await schemas.task.service.getDetail({
                                    domain_key: item.key,
                                    id: sync.data.task_id,
                                })
                            } catch (error) {
                                if (this.mysetInterval) {
                                    clearInterval(this.mysetInterval)
                                }
                            }

                            if (data) {
                                if (data.status === "end") {
                                    const args = {
                                        message: (
                                            <span>
                                                <span>
                                                    {data.name + "已完成"}
                                                </span>
                                                <Tooltip title="查看详情">
                                                    <a
                                                        onClick={() => {
                                                            this.handleTaskInfo(
                                                                item,
                                                                data.id
                                                            )
                                                        }}
                                                    >
                                                        <QuestionCircleOutlined
                                                            style={{
                                                                marginLeft:
                                                                    "5px",
                                                            }}
                                                        />
                                                    </a>
                                                </Tooltip>
                                            </span>
                                        ),
                                        description: (
                                            <Progress
                                                strokeColor={{
                                                    "0%": "#108ee9",
                                                    "100%": "#87d068",
                                                }}
                                                percent={100}
                                            />
                                        ),
                                        duration: 0,
                                    }
                                    clearInterval(this.mysetInterval)
                                    notification.open(args)
                                }
                            } else {
                                clearInterval(this.mysetInterval)
                            }
                        }, 10000)
                    } catch (error) {
                        message.error(error.message)
                        if (this.mysetInterval) {
                            clearInterval(this.mysetInterval)
                        }
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
                {tabActiveKey === infoType.Repeat && <Repeat />}
            </PageHeaderWrapper>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
