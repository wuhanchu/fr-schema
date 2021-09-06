import React, { PureComponent } from "react"
import "@ant-design/compatible/assets/index.css"
import { Modal, Skeleton, Spin } from "antd"
import InfoForm from "@/outter/fr-schema-antd-utils/src/components/Page/InfoForm"
import departmentService from "@/pages/authority/department/service"
import { dataConvert } from "@/pages/authority/department/DataList"
import clone from "clone"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
const { actions, getPrimaryKey, schemaFieldType } = frSchema

const confirm = Modal.confirm

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

export class UserTransfer extends PureComponent {
    formRef = React.createRef()

    state = {
        loadingFetch: true,
        loadingSubmit: false,
    }

    constructor(props) {
        super(props)
        const { addArgs, visible, onRef, values, service } = props
        this.service = service
        this.state.visible = visible
        this.state.values = values
        onRef && onRef(this)
    }

    show = (values) => {
        const { addArgs } = this.props

        this.setState({
            visible: true,
            values: { ...addArgs, ...values },
        })
    }

    hide = () => {
        this.setState({
            visible: false,
            values: null,
        })
    }

    async componentDidMount() {
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
            nameDict,
            departmentDict,
        })

        const dataSource =
            this.props.userList &&
            this.props.userList.list.map((item) => {
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
        this.schema = schemas

        this.setState({ loadingFetch: false })
        const { componentDidMount } = this.props
        componentDidMount && componentDidMount()
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

    /**
     * 确认保存
     */
    handleSave = () => {
        const { handleUpdate, handleAdd, action, addArgs } = this.props
        const { values } = this.state

        this.setState({ loadingSubmit: true })

        this.formRef.current
            .validateFields()
            .then(async (fieldsValue) => {
                let param = addArgs ? { ...addArgs } : {}
                const idKey = getPrimaryKey(this.schema)

                // set the id value
                if (values) {
                    const idValue = values[idKey || "id"]
                    idValue && (param[idKey] = idValue)
                }

                Object.keys(fieldsValue).forEach((key) => {
                    param[key] =
                        fieldsValue[key] instanceof Array &&
                        fieldsValue[key][0] instanceof String
                            ? fieldsValue[key].join(",")
                            : fieldsValue[key]
                })

                if (this.props.convertParam) {
                    param = this.props.convertParam(param)
                }

                if (action === actions.edit) {
                    await handleUpdate(param, this.schema)
                } else {
                    await handleAdd(param, this.schema)
                }
            })
            .catch((err) => {
                console.log("err", err)
            })
            .finally((_) => {
                this.setState({ loadingSubmit: false })
            })
    }

    /**
     * 渲染表单
     * @returns {*}
     */
    renderForm() {
        const { values } = this.state
        // 只传入InForm所需参数,避免console报错
        const {
            renderForm,
            handleVisibleModal,
            handleUpdate,
            handleAdd,
            visible,
            addArgs,
            ...otherProps
        } = this.props
        return renderForm && typeof renderForm === "function" ? (
            renderForm({
                ...this.props,
                values,
                schema: this.schema,
            })
        ) : (
            <InfoForm
                {...otherProps}
                values={values}
                schema={this.schema}
                form={this.formRef}
            />
        )
    }

    /**
     * 弹出框关闭前调用
     */
    beforeFormClose = (otherProps) => {
        const { values } = this.state
        const { action } = this.props
        const fieldsValue = this.formRef.current.getFieldsValue()
        const flag = Object.keys(fieldsValue).some((key) => {
            let result =
                fieldsValue[key] && (!values || values[key] != fieldsValue[key])

            // moment 比较
            if (fieldsValue[key] && fieldsValue[key].isSame && values) {
                result = !fieldsValue[key].isSame(values[key])
            }

            if (result) {
                console.log(`字段${key}被修改为${values}`)
            }
            return result
        })

        if (flag && action !== actions.show) {
            confirm({
                title: "提示",
                content: "数据已做修改，确认关闭对话框？",
                okText: "关闭",
                cancelText: "取消",
                onOk: () => {
                    this.closeModel()
                },
                onCancel: () => {
                    return
                },
            })
            return false
        } else {
            this.closeModel()
        }
    }

    /**
     * 关闭弹出框
     */
    closeModel = () => {
        const { handleVisibleModal, onCancel } = this.props
        this.setState({
            visible: false,
        })
        handleVisibleModal && handleVisibleModal()
        onCancel && onCancel()
    }

    render() {
        const { loadingSubmit } = this.state

        const { title, action, ...otherProps } = this.props
        const { visible, values } = this.state

        if (!visible) {
            return null
        }

        // 查看模式 不需要显示 按钮
        if (action == actions.show) {
            otherProps.footer = null
        }

        return (
            <Modal
                width={700}
                destroyOnClose
                title={title || "" + "信息"}
                visible={true}
                onOk={this.handleSave}
                okButtonProps={{
                    loading: this.props.loadingSubmit || loadingSubmit,
                }}
                {...otherProps}
                onCancel={() => {
                    if (this.beforeFormClose(otherProps) === false) {
                        // otherProps.onCancel && otherProps.onCancel()

                        return false
                    }

                    otherProps.onCancel && otherProps.onCancel()
                }}
            >
                {this.state.loadingFetch ? (
                    <Skeleton />
                ) : (
                    <Spin spinning={loadingSubmit}>{this.renderForm()}</Spin>
                )}
            </Modal>
        )
    }
}

export default UserTransfer
