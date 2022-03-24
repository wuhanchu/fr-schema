import ListPage from "@/components/ListPage/ListPage"
import React from "react"
import { PageHeaderWrapper } from "@ant-design/pro-layout"
import { connect } from "dva"
import moment from "moment"
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
import List from "./List"
import Intent from "./Intent"
import schemas from "@/schemas"
import {
    LoadingOutlined,
    InfoCircleOutlined,
    SyncOutlined,
    WarningOutlined,
    DownOutlined,
} from "@ant-design/icons"

const { Step } = Steps

// 微信信息类型
export const infoType = {
    List: "意图列表",
    Intent: "意图矛盾检测",
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
        let domain_key = localStorage.getItem("domain_key")
        if (!domain_key) {
            localStorage.setItem("domain_key", "default")
        } else {
            if (domain_key && !props.dict.domain[domain_key]) {
                localStorage.setItem("domain_key", "default")
                domain_key = "default"
            }
        }
        const localStorageDomainKey = localStorage.getItem("domain_key")
        super(props)

        const { query } = this.props.location
        const tabActiveKey = query && query.type ? query.type : infoType.List
        this.state = {
            tabActiveKey,
            localStorageDomainKey,
        }
    }

    async componentDidMount() {
        let data = await schemas.domain.service.get({ limit: 10000 })
        this.setState({ domian: data.list })
    }

    handleIntervals = async (record, id, name, props) => {
        let res
        try {
            res = await schemas.task.service.get({
                domain_key: record.key,
                order: "create_time.desc",
                ...props,
            })
        } catch (error) {
            if (this.mysetIntervals) {
                clearInterval(this.mysetIntervals)
            }
            return
        }

        if (!this.state.showProcess) {
            return
        }
        let data = res.list && res.list[0]
        if (data) {
            if (data.status === "end") {
                if (this.mysetInterval) {
                    clearInterval(this.mysetInterval)
                }
                const args = {
                    message: (
                        <span>
                            <span>{data.name + "已完成"}</span>
                            <Tooltip title="查看详情">
                                <a
                                    onClick={() => {
                                        this.handleTaskInfo(record, data.id)
                                    }}
                                >
                                    <InfoCircleOutlined
                                        style={{ marginLeft: "5px" }}
                                    />
                                </a>
                            </Tooltip>
                        </span>
                    ),
                    key: "process",
                    onClose: () => {
                        this.setState({
                            showProcess: false,
                        })
                        notification.destroy("info")
                        clearInterval(this.mysetIntervals)
                    },
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
                this.setState({ process: 0 })
                notification.open(args)
                setTimeout(() => {
                    clearInterval(this.mysetIntervals)
                }, 700)
            } else {
                this.setState({ process: data.process })
                const args = {
                    message: (
                        <span>
                            <span>{data.name}</span>
                            <Tooltip title="查看详情">
                                <a
                                    onClick={() => {
                                        this.handleTaskInfo(record, data.id)
                                    }}
                                >
                                    <InfoCircleOutlined
                                        style={{ marginLeft: "5px" }}
                                    />
                                </a>
                            </Tooltip>
                        </span>
                    ),
                    key: "process",
                    onClose: () => {
                        this.setState({
                            showProcess: false,
                        })
                        notification.destroy("info")
                        clearInterval(this.mysetIntervals)
                    },
                    description: (
                        <Progress
                            strokeColor={{
                                "0%": "#108ee9",
                                "100%": "#87d068",
                            }}
                            percent={
                                this.mysetIntervals
                                    ? (this.state && this.state.process) || 0
                                    : 100
                            }
                        />
                    ),
                    duration: 0,
                }
                notification.open(args)
            }
        } else {
            const args = {
                message: "暂无数据",
                key: "process",
                onClose: () => {
                    clearInterval(this.mysetIntervals)
                    this.setState({
                        showProcess: false,
                    })
                    notification.destroy("info")
                },
                description: "请稍后查询",
                duration: 0,
            }

            notification.open(args)
            setTimeout(() => {
                clearInterval(this.mysetIntervals)
            }, 700)
        }
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
            order: "create_time.desc",
            limit: 2000,
        })
        if (res.list.length) {
            let mySteps = (
                <Steps
                    direction="vertical"
                    progressDot
                    style={{ maxHeight: "500px", overflowY: "auto" }}
                    current={res.list.length}
                >
                    {res.list.map((item) => {
                        return (
                            <Step
                                title={
                                    <span>
                                        <span>{item.name}</span>
                                        {item.remark && (
                                            <Tooltip title={item.remark}>
                                                <a>
                                                    <WarningOutlined
                                                        style={{
                                                            marginLeft: "5px",
                                                            color: "red",
                                                        }}
                                                    />
                                                </a>
                                            </Tooltip>
                                        )}
                                    </span>
                                }
                                description={moment(item.create_time).format(
                                    "YYYY-MM-DD HH:mm:ss"
                                )}
                            />
                        )
                    })}
                </Steps>
            )
            args = {
                message: (
                    <span>
                        <span>任务详情</span>
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
                duration: 0,
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

    handleGetTask = (record, id, name) => {
        notification.destroy("info")
        this.setState({ showProcess: true })
        let props = {}
        props.id = id
        props.name = name
        const args = {
            message: "查询中",
            key: "process",
            onClose: () => {
                this.setState({
                    showProcess: false,
                })
                notification.destroy("info")
                clearInterval(this.mysetIntervals)
            },
            description: <LoadingOutlined />,
            duration: 0,
        }

        notification.open(args)
        try {
            this.handleIntervals(record, id, name, props)

            this.mysetIntervals = setInterval(async () => {
                this.handleIntervals(record, id, name, props)
            }, 5000)
        } catch (error) {
            if (this.mysetIntervals) {
                clearInterval(this.mysetIntervals)
            }
        }
    }

    componentWillUnmount() {
        notification.destroy("process")
        clearInterval(this.mysetIntervals)
    }

    handleDomainChange = (item) => {
        let otherTabActiveKey = this.state.tabActiveKey
        this.setState({
            localStorageDomainKey: item.key,
        })
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
                        if (this.mysetIntervals) {
                            clearInterval(this.mysetIntervals)
                        }
                        if (this.mysetInterval) {
                            clearInterval(this.mysetInterval)
                        }
                        this.handleGetTask(
                            { ...item, key: item.key },
                            sync.data.task_id,
                            undefined
                        )

                        this.setState({ isLoading: false })
                        // message.success("创建成功，请查看进度！")
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
                                                        <InfoCircleOutlined
                                                            style={{
                                                                marginLeft:
                                                                    "5px",
                                                            }}
                                                        />
                                                    </a>
                                                </Tooltip>
                                            </span>
                                        ),
                                        key: "process",
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
                        console.log("handleGetTask")
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
            <Button
                onClick={async () => {
                    let item = this.state.localStorageDomainKey
                    try {
                        this.setState({ isLoading: true })
                        let sync = await schemas.mark.service.intent_mark_task({
                            domain_key: item.key,
                        })
                        if (this.mysetIntervals) {
                            clearInterval(this.mysetIntervals)
                        }
                        if (this.mysetInterval) {
                            clearInterval(this.mysetInterval)
                        }
                        this.handleGetTask(
                            { ...item, key: item.key },
                            sync.data.task_id,
                            undefined
                        )

                        this.setState({ isLoading: false })
                        // message.success("创建成功，请查看进度！")
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
                                                        <InfoCircleOutlined
                                                            style={{
                                                                marginLeft:
                                                                    "5px",
                                                            }}
                                                        />
                                                    </a>
                                                </Tooltip>
                                            </span>
                                        ),
                                        key: "process",
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
                        console.log("handleGetTask")
                    } catch (error) {
                        message.error(error.message)
                        if (this.mysetInterval) {
                            clearInterval(this.mysetInterval)
                        }
                        this.setState({ isLoading: false })
                    }
                }}
            >
                {this.state.isLoading && <LoadingOutlined />}创建检测
            </Button>
        )

        const { dict, data } = this.props
        let domain = []
        if (dict) {
            Object.keys(dict.domain).forEach((key) => {
                domain.push(dict.domain[key])
            })
        }
        const extraMenu = (
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
        const extra = (
            <Dropdown overlay={extraMenu} placement="bottomLeft">
                <Button style={{ top: "-35px", float: "right" }}>
                    {(this.state.localStorageDomainKey &&
                        dict &&
                        dict.domain[this.state.localStorageDomainKey].name) ||
                        "选择数据域"}
                    <DownOutlined />
                </Button>
            </Dropdown>
        )
        return (
            <PageHeaderWrapper
                title={false}
                extra={extra}
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
                {tabActiveKey === infoType.List && (
                    <List domain_key={this.state.localStorageDomainKey} />
                )}
                {tabActiveKey === infoType.Intent && (
                    <Intent domain_key={this.state.localStorageDomainKey} />
                )}
            </PageHeaderWrapper>
        )
    }
}

export default connect(({ global }) => ({
    dict: global.dict,
}))(Main)
