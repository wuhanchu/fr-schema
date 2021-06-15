import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import SearchPageModal from "@/pages/question/components/SearchPageModal"
import { Divider, message, Modal, Popconfirm } from "antd"
import DialogueModal from "@/pages/question/components/DialogueModal"
import YamlEdit from "@/pages/story/yamlEdiit"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import UserTransfer from "./component/UserTransfer"
import HotWord from "./component/HotWord"

const { schemaFieldType } = frSchema

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
            operateWidth: "470px",
            infoProps: {
                offline: true,
            },
        })
    }

    async componentDidMount() {
        let aiService = await this.service.getServices({
            limit: 10000,
            ai_type: "eq.chat",
        })
        this.schema.talk_service_id.dict = listToDict(aiService.list)
        const data = await this.service.getUserAuthUser()

        this.setState({
            userList: data,
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
            let response = await this.service[method](data, schema)
            this.refreshList()
            message.success("修改成功")
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
                    let response = await this.service[method](data, schema)
                    this.refreshList()
                    message.success("修改成功")
                    this.handleVisibleModal()
                    return response
                },
            })
        }
    }

    async handleAdd(data, schema) {
        let response = await this.service.post(data, schema)
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
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    handleUpdates = async (data, schemas, method = "patch") => {
        // 更新
        let response = await this.service.setUser(
            { ...data, domain_key: this.state.record.key },
            schemas
        )
        this.refreshList()
        message.success("操作成功")
        this.handleVisibleModal()
        if (this.handleChangeCallback) {
            this.handleChangeCallback()
        }
        if (this.props.handleChangeCallback) {
            this.props.handleChangeCallback()
        }

        return response
    }

    renderExtend() {
        const { record, visibleSearch, visibleDialogue } = this.state
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
                        <HotWord record={this.state.record}></HotWord>
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

    renderOperateColumnExtend(record) {
        return (
            <Fragment>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleSearch: true })
                    }}
                >
                    搜索
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleDialogue: true })
                    }}
                >
                    对话
                </a>
                <Divider type="vertical" />
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
                <Divider type="vertical" />
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
                <Divider type="vertical" />
                <Popconfirm
                    title="是否将域中问题导入Elasticsearch？"
                    onConfirm={async (e) => {
                        await this.service.sync({ domain_key: record.key })
                        message.success("数据同步中！")
                        e.stopPropagation()
                    }}
                >
                    <a>同步</a>
                </Popconfirm>
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
