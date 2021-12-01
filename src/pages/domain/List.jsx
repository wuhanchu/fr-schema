import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import SearchPageModal from "@/pages/question/components/SearchPageModal"
import {
    Divider,
    message,
    Modal,
    Popconfirm,
    Menu,
    Dropdown,
    notification,
    Progress,
} from "antd"
import DialogueModal from "@/pages/question/components/DialogueModal"
import YamlEdit from "@/pages/story/yamlEdiit"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import UserTransfer from "./component/UserTransfer"
import HotWord from "./component/HotWord"
import Task from "./component/Task"

import SearchHistory from "./component/SearchHistory"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

import IntentIdentify from "./component/IntentIdentify"
import { DownOutlined, LoadingOutlined } from "@ant-design/icons"

const { actions } = frSchema

@connect(({ global, user }) => ({
    dict: global.dict,
    global: global,
    user: user,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.domain.schema,
            service: schemas.domain.service,
            infoProps: {
                offline: true,
            },
            operateWidth: "360px",
        })
    }

    async componentDidMount() {
        let aiService = await this.service.getServices({
            limit: 10000,
            ai_type: "eq.chat",
        })
        let projectList = await schemas.project.service.get({
            limit: 10000,
        })
        this.schema.talk_service_id.dict = listToDict(aiService.list)
        const data = await this.service.getUserAuthUser()

        this.setState({
            userList: data,
            projectList: projectList.list,
        })

        super.componentDidMount()
    }

    handleSetYamlEditVisible = (visible) => {
        this.setState({
            showYamlEdit: visible,
        })
    }

    handleUpdate = async (data, schema, method = "patch") => {
        // 更新
        if (this.state.infoData.key === data.key) {
            let response
            try {
                response = await this.service[method](data, schema)
                this.refreshList()
                message.success("修改成功")
            } catch (error) {
                message.error(error.message)
            }

            this.handleVisibleModal()
            return response
        } else {
            Modal.confirm({
                title: "修改编码会导致大量数据不可用！",
                okText: "确认提交",
                onCancel: () => {
                    this.setState({
                        showConfirm: false,
                        showConfirmLoading: false,
                    })
                },
                cancelText: "取消",
                onOk: async () => {
                    let response
                    try {
                        response = await this.service[method](data, schema)
                        this.refreshList()
                        message.success("修改成功")
                    } catch (error) {
                        message.error(error.message)
                    }

                    this.handleVisibleModal()
                    return response
                },
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.mysetIntervals)
    }

    async handleAdd(data, schema) {
        let response
        try {
            response = await this.service.post(data, schema)
            response = await this.service.setUser(
                {
                    users_id: [parseInt(this.props.user.currentUser.id)],
                    domain_key: data.key,
                },
                schema
            )
            message.success("添加成功")
            this.refreshList()
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }

        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    handleUpdates = async (data, schemas, method = "patch") => {
        // 更新
        let response
        try {
            response = await this.service.setUser(
                { ...data, domain_key: this.state.record.key },
                schemas
            )
            this.refreshList()
            message.success("操作成功")
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }

        if (this.handleChangeCallback) {
            this.handleChangeCallback()
        }
        if (this.props.handleChangeCallback) {
            this.props.handleChangeCallback()
        }

        return response
    }

    renderExtend() {
        const {
            record,
            visibleSearch,
            visibleDialogue,
            visibleIntentIdentify,
            visibleSearchHistory,
        } = this.state
        return (
            <Fragment>
                {visibleSearch && (
                    <SearchPageModal
                        type={"domain_id"}
                        onCancel={() => {
                            this.setState({ visibleSearch: false })
                        }}
                        title={"知识搜索" + "(" + record.name + ")"}
                        record={record}
                    />
                )}
                {visibleDialogue && (
                    <DialogueModal
                        type={"domain_id"}
                        record={record}
                        visibleDialogue={visibleDialogue}
                        title={"对话" + "(" + record.name + ")"}
                        handleHideDialogue={() =>
                            this.setState({ visibleDialogue: false })
                        }
                    />
                )}
                {this.state.showYamlEdit && (
                    <YamlEdit
                        handleSetYamlEditVisible={this.handleSetYamlEditVisible}
                        service={this.service}
                        title={
                            this.state.schemasName === "content"
                                ? "内容"
                                : "配置"
                        }
                        refreshList={this.refreshList.bind(this)}
                        schemasName={this.state.schemasName}
                        record={this.state.record}
                    />
                )}
                {this.state.visibleAssign && this.renderAssignModal()}
                {visibleIntentIdentify && (
                    <IntentIdentify
                        onCancel={() => {
                            this.setState({ visibleIntentIdentify: false })
                        }}
                        style={{ height: "900px" }}
                        record={{ ...record, id: record.talk_service_id }}
                    />
                )}
                {this.state.showHotWord && (
                    <Modal
                        title={"热门问题"}
                        width={"70%"}
                        visible={this.state.showHotWord}
                        footer={null}
                        onCancel={() => {
                            this.setState({ showHotWord: false })
                        }}
                    >
                        <HotWord domain_key={this.state.record.key} />
                    </Modal>
                )}
                {this.state.showTask && (
                    <Modal
                        title={"模型任务"}
                        width={"224px"}
                        visible={this.state.showTask}
                        footer={null}
                        onCancel={() => {
                            this.setState({ showTask: false })
                        }}
                    >
                        <Task domain_key={this.state.record.key} />
                    </Modal>
                )}
                {visibleSearchHistory && (
                    <Modal
                        title={"提问历史"}
                        width={"90%"}
                        visible={this.state.visibleSearchHistory}
                        footer={null}
                        onCancel={() => {
                            this.setState({ visibleSearchHistory: false })
                        }}
                    >
                        <SearchHistory record={this.state.record} />
                    </Modal>
                )}
            </Fragment>
        )
    }

    renderAssignModal() {
        const { visibleAssign } = this.state
        return (
            visibleAssign && (
                <UserTransfer
                    title="人员分配"
                    onCancel={() => {
                        this.setState({ visibleAssign: false })
                    }}
                    action="add"
                    width="1100px"
                    userList={this.state.userList}
                    handleAdd={(...props) => {
                        this.handleUpdates(
                            ...props.concat([this.schema, "put"]),
                            null,
                            "put"
                        )
                        this.setState({ visibleAssign: false })
                    }}
                    visible
                    values={{ users_id: this.state.teamHaveUser }}
                    schema={schemas}
                    service={this.service}
                />
            )
        )
    }

    renderOperateColumn(props = {}) {
        const { scroll } = this.meta
        const { inDel } = this.state
        const { showEdit = true, showDelete = true } = {
            ...this.meta,
            ...props,
        }
        return (
            !this.meta.readOnly &&
            !this.props.readOnly && {
                title: "操作",
                width: this.meta.operateWidth,
                fixed: "right",
                render: (text, record) => (
                    <>
                        {showEdit && (
                            <a
                                onClick={() =>
                                    this.handleVisibleModal(
                                        true,
                                        record,
                                        actions.edit
                                    )
                                }
                            >
                                修改
                            </a>
                        )}
                        {showDelete && record.key !== "default" && (
                            <>
                                {showEdit && <Divider type="vertical" />}
                                <Popconfirm
                                    title="是否要删除此行？"
                                    onConfirm={async (e) => {
                                        this.setState({ record })
                                        await this.handleDelete(record)
                                        e.stopPropagation()
                                    }}
                                >
                                    <a>
                                        {inDel &&
                                            this.state.record.id &&
                                            this.state.record.id ===
                                                record.id && (
                                                <LoadingOutlined />
                                            )}
                                        删除
                                    </a>
                                </Popconfirm>
                            </>
                        )}
                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
        )
    }

    renderOperateColumnExtend(record) {
        const testMenu = (
            <Menu>
                <Menu.Item>
                    <a
                        onClick={() => {
                            this.setState({ record, visibleDialogue: true })
                        }}
                    >
                        对话
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        onClick={() => {
                            this.setState({ record, visibleSearch: true })
                        }}
                    >
                        搜索
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        onClick={async () => {
                            this.setState({
                                visibleIntentIdentify: true,
                                record,
                            })
                        }}
                    >
                        意图识别
                    </a>
                </Menu.Item>
            </Menu>
        )
        const rasaMenu = (
            <Menu>
                <Menu.Item>
                    <a
                        onClick={() => {
                            this.setState({
                                showYamlEdit: true,
                                record,
                                schemasName: "content",
                            })
                        }}
                    >
                        内容
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        onClick={() => {
                            this.setState({
                                showYamlEdit: true,
                                record,
                                schemasName: "config",
                            })
                        }}
                    >
                        配置
                    </a>
                </Menu.Item>
            </Menu>
        )
        const menu = (
            <Menu>
                <Menu.Item>
                    <Popconfirm
                        title={
                            "是否训练" +
                            record.name +
                            "域模型？会影响查询性能！"
                        }
                        onConfirm={async (e) => {
                            await this.service.sync({ domain_key: record.key })
                            message.success("模型训练中！")
                            this.mysetInterval = setInterval(async () => {
                                let data = await schemas.task.service.getDetail(
                                    { domain_key: record.key, id: 1 }
                                )
                                console.log(data)
                                if (data.status === "end") {
                                    const args = {
                                        message: "已完成",
                                        description: "训练已完成",
                                        duration: 0,
                                    }
                                    clearInterval(this.mysetInterval)
                                    notification.open(args)
                                }
                            }, 10000)
                            e.stopPropagation()
                        }}
                    >
                        <a>模型训练</a>
                    </Popconfirm>
                </Menu.Item>
                <Menu.Item>
                    <Popconfirm
                        title={"是否将" + record.name + "域数据同步数据库！"}
                        onConfirm={async (e) => {
                            await this.service.fsfundSync({
                                domain_key: record.key,
                            })
                            message.success("数据已同步！")
                            e.stopPropagation()
                        }}
                    >
                        <a>同步数据</a>
                    </Popconfirm>
                </Menu.Item>

                <Menu.Item>
                    <a
                        onClick={async () => {
                            this.setState({
                                showHotWord: true,
                                record,
                            })
                        }}
                    >
                        热门问题
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        onClick={async () => {
                            // this.setState({
                            //     showTask: true,
                            //     record,
                            // })

                            this.mysetIntervals = setInterval(async () => {
                                let res = await schemas.task.service.get({
                                    domain_key: record.key,
                                    order: "create_time.desc",
                                })
                                let data = res.list && res.list[0]
                                if (data) {
                                    if (data.status === "end") {
                                        const args = {
                                            message:
                                                this.state &&
                                                this.state.process === 100
                                                    ? "已完成"
                                                    : "训练中",
                                            key: "process",
                                            onClose: () => {
                                                clearInterval(
                                                    this.mysetIntervals
                                                )
                                            },
                                            description: (
                                                <Progress
                                                    strokeColor={{
                                                        "0%": "#108ee9",
                                                        "100%": "#87d068",
                                                    }}
                                                    percent={
                                                        (this.state &&
                                                            this.state
                                                                .process) ||
                                                        0
                                                    }
                                                />
                                            ),
                                            duration: 0,
                                        }

                                        this.setState({ process: data.process })
                                        notification.open(args)
                                        setTimeout(() => {
                                            clearInterval(this.mysetIntervals)
                                        }, 700)
                                    } else {
                                        const args = {
                                            message: this.mysetIntervals
                                                ? "训练中"
                                                : "已完成",
                                            key: "process",
                                            onClose: () => {
                                                clearInterval(
                                                    this.mysetIntervals
                                                )
                                            },
                                            description: (
                                                <Progress
                                                    strokeColor={{
                                                        "0%": "#108ee9",
                                                        "100%": "#87d068",
                                                    }}
                                                    percent={
                                                        this.mysetIntervals
                                                            ? (this.state &&
                                                                  this.state
                                                                      .process) ||
                                                              0
                                                            : 100
                                                    }
                                                />
                                            ),
                                            duration: 0,
                                        }
                                        notification.open(args)
                                        this.setState({ process: data.process })
                                    }
                                } else {
                                    const args = {
                                        message: "暂无训练",
                                        key: "process",
                                        onClose: () => {
                                            clearInterval(this.mysetIntervals)
                                        },
                                        description: "暂时没有模型正在训练",
                                        duration: 0,
                                    }

                                    notification.open(args)
                                    setTimeout(() => {
                                        clearInterval(this.mysetIntervals)
                                    }, 700)
                                }
                            }, 1000)
                        }}
                    >
                        训练进度
                    </a>
                </Menu.Item>
                <Menu.Item>
                    <a
                        onClick={async () => {
                            this.setState({
                                visibleSearchHistory: true,
                                record,
                            })
                        }}
                    >
                        提问历史
                    </a>
                </Menu.Item>
            </Menu>
        )
        return (
            <Fragment>
                <Divider type="vertical" />
                <a
                    onClick={async () => {
                        const domainUser = await this.service.getDomainUser({
                            domain_key: `eq.${record.key}`,
                        })
                        const teamHaveUser = []
                        if (domainUser) {
                            domainUser.list.map((item) => {
                                teamHaveUser.push(item.user_id)
                                return item
                            })
                        }
                        this.setState({
                            record,
                            visibleAssign: true,
                            teamHaveUser: teamHaveUser,
                        })
                        this.setState({
                            record,
                            teamHaveUser,
                            visibleAssign: true,
                            domainUser: domainUser.list,
                        })
                    }}
                >
                    人员分配
                </a>
                <Divider type="vertical" />
                <Dropdown overlay={testMenu}>
                    <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        {"测试 "}
                        <DownOutlined />
                    </a>
                </Dropdown>
                <Divider type="vertical" />
                <Dropdown overlay={rasaMenu}>
                    <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        {"RASA "}
                        <DownOutlined />
                    </a>
                </Dropdown>
                <Divider type="vertical" />
                <Dropdown overlay={menu}>
                    <a
                        className="ant-dropdown-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        {"更多 "}
                        <DownOutlined />
                    </a>
                </Dropdown>
            </Fragment>
        )
    }
    renderSearchBar() {
        const { name } = this.schema
        const filters = this.createFilters(
            {
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
