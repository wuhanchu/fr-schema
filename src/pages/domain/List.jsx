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
import { dataConvert } from "@/pages/authority/department/DataList"
import departmentService from "@/pages/authority/department/service"
import clone from "clone"

const { schemaFieldType } = frSchema

function searchTree(tree, id) {
    let res = findNode(tree, id)

    //边界处理，输入的id不存在相对应的节点时
    if (res == undefined) {
        return "在该树的中没有相对应的id的节点"
    }

    res.path.unshift(tree.name)
    let path = res.path.join("/")
    let node = res.node
    let leaves = findLeaves(node)
    return {
        path,
        leaves,
    }
}

// 深度遍历查找目标节点及缓存相关路径
function findNode(tree, id) {
    if (tree.key == id) {
        return {
            path: [],
            node: tree,
        }
    }

    // console.log(tree)

    let res
    for (let i = 0; i < tree.children.length; i++) {
        res = findNode(tree.children[i], id)
        if (res != undefined) {
            res.path.unshift(tree.children[i].name)
            return res
        }
    }
    return undefined
}

// 递归获取叶子节点
function findLeaves(node) {
    if (node.children.length == 0) {
        return [node.key]
    }
    let leaves = []
    let res
    for (let i = 0; i < node.children.length; i++) {
        res = findLeaves(node.children[i])
        leaves = res.concat(leaves)
    }
    return leaves
}

@connect(({ global }) => ({
    dict: global.dict,
    global: global,
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

        let list = response.list.map((item) => {
            return { ...item, children: [] }
        })

        let departmentConvert = dataConvert(clone({ list: list }))

        let nameDict = {}
        response.list.map((item, index) => {
            console.log(item.key)
            nameDict[item.key] = {
                ...searchTree(
                    { children: departmentConvert.list, key: "qw" },
                    item.key
                ),
                key: item.key,
            }
        })
        console.log(nameDict)
        const departmentDict = listToDict(response.list, null, "key", "name")
        this.setState({
            userList: data,
            nameDict,
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
                if (index !== data.department_key.length - 1)
                    name = name + this.state.nameDict[item].path.substr(1) + "-"
                else {
                    name = name + this.state.nameDict[item].path.substr(1)
                }
            })
        return name
    }

    renderAssignModal() {
        const dataSource =
            this.state.userList &&
            this.state.userList.list.map((item) => {
                let name = this.getName(item)
                if (name) {
                    name = "(" + name + ")"
                }
                return {
                    key: item.id,
                    ...item,
                    name: item.name + name,
                }
            })
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
