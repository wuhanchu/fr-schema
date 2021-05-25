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
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
// import {dataConvert} from "@/pages/authority/department/DataList"
import clone from "clone"
import UserTransfer from "@/pages/domain/component/UserTransfer"

import departmentService from "@/pages/authority/department/service"

const { schemaFieldType } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.domain.schema,
            service: schemas.domain.service,
            operateWidth: "390px",
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

        const response = await departmentService.get({
            limit: 1000,
        })
        // console.log(dataConvert(response))
        // let nameDict = []
        const departmentDict = listToDict(response.list, null, "key", "name")
        this.setState({
            userList: data,
            departmentDict,
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

    handleUpdates = async (data, schemas, method = "patch") => {
        // 更新
        let response = await this.service.setUser(
            { ...data, domain_key: this.state.record.key },
            schemas
        )
        this.refreshList()
        message.success("修改成功")
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
                        title={record.name + "知识搜索"}
                        record={record}
                    />
                )}
                {visibleDialogue && (
                    <DialogueModal
                        type={"domain_id"}
                        record={record}
                        visibleDialogue={visibleDialogue}
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
            </Fragment>
        )
    }

    getName = (data) => {
        let name = ""
        data.department_key &&
            data.department_key[0] &&
            this.state.departmentDict &&
            data.department_key.map((item, index) => {
                name = "-" + name + this.state.departmentDict[item].name + "-"
            })
        return name
    }

    renderAssignModal() {
        const dataSource =
            this.state.userList &&
            this.state.userList.list.map((item) => ({
                key: item.id,
                ...item,
                name: item.name + this.getName(item),
            }))
        const { visibleAssign } = this.state
        const schemas = {
            users_id: {
                title: "人员",
                type: schemaFieldType.Transfer,
                itemProps: {
                    labelCol: {
                        span: 3,
                    },
                },
                props: {
                    dataSource,
                    style: { width: 850 },
                    listStyle: {
                        width: 400,
                        height: 400,
                    },
                },
            },
        }
        //  return
        console.log(this.state.teamHaveUser)
        return (
            visibleAssign && (
                <InfoModal
                    title="人员分配"
                    onCancel={() => {
                        this.setState({ visibleAssign: false })
                    }}
                    action="add"
                    width="1100px"
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
                    title="是否导将域中问题导入Elasticsearch？"
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
                        const teamUser = await this.service.getTeamUser({
                            domain_key: `eq.${record.key}`,
                        })
                        const teamHaveUser = []
                        if (teamUser) {
                            teamUser.list.map((item) => {
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
                            oldTeamUser: teamHaveUser,
                            teamUser: teamUser.list,
                            totalTeamUser: [],
                        })
                    }}
                >
                    人员分配
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
