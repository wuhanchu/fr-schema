import React, { PureComponent } from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { message, Modal, Skeleton, Spin, Button, Popconfirm } from "antd"
import InfoForm from "@/outter/fr-schema-antd-utils/src/components/Page/InfoForm"
import frSchema from "@/outter/fr-schema/src"
import { clone } from "lodash"
import { v5 as uuidv5 } from "uuid"

const { actions, getPrimaryKey } = frSchema
const confirm = Modal.confirm

/**
 * @param offline dont't request data from remtoe
 * @param title  null,
 * @param visible false,
 * @param onRef null,
 * @param action null, // the action value
 * @param values null, // the record value
 * @param addArgs:null, // 编辑时带上的固有参数
 * @param handleVisibleModal: null,
 * @param handleUpdate: null,
 * @param service:null,当前使用的service
 * @param schema:null,当前的schema
 * @param handleAdd: null,
 * @param componentDidMount: null,
 */
export class PureInfoModal extends PureComponent {
    formRef = React.createRef()

    state = {
        loadingFetch: true,
        loadingSubmit: false,
    }

    constructor(props) {
        super(props)
        const { addArgs, visible, onRef, values, schema, service } = props
        this.state.visible = visible
        this.state.values = { ...(addArgs || {}), ...(values || {}) }
        this.schema = schema
        this.service = service

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
        if (this.service && this.state.values.id && !this.props.offline) {
            let data = this.state.values
            if (this.service.getDetail) {
                const param = {}
                param[getPrimaryKey(this.schema)] = this.state.values.id
                data = await this.service.getDetail(param)
            }

            this.setState({ values: data, loadingFetch: false })
        } else {
            this.setState({ loadingFetch: false })
        }

        const { componentDidMount } = this.props
        componentDidMount && componentDidMount()
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
                values,
                form: this.formRef,
                ...this.props,
            })
        ) : (
            <InfoForm {...otherProps} values={values} form={this.formRef} />
        )
    }

    /**
     * 弹出框关闭前调用
     */
    beforeFormClose = () => {
        const { values } = this.state
        const { action } = this.props
        if (!this.formRef.current) {
            this.closeModel()
            return
        }
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
        const { handleVisibleModal } = this.props
        this.setState({
            visible: false,
        })
        handleVisibleModal && handleVisibleModal()
    }

    handleReFollow = (key, uuidUrl) => {
        if (key) {
            // if(key.length> 24){
            //     return key.slice(0,23) + time
            // }
            // else{
            //     return key + time
            // }
            let data = uuidv5(key, uuidUrl)
            return data
        } else {
            return key
        }
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

        let footerOther = []
        if (otherProps.footerOther) {
            footerOther = otherProps.footerOther
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
                    if (this.beforeFormClose() === false) {
                        return false
                    }
                    otherProps.onCancel && otherProps.onCancel()
                }}
                footer={[
                    <Button
                        key="back"
                        onClick={() => {
                            if (this.beforeFormClose() === false) {
                                return false
                            }
                            otherProps.onCancel && otherProps.onCancel()
                        }}
                    >
                        取消
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => {
                            // let time = new Date().getTime()
                            let time = uuidv5.URL
                            console.log(time)
                            console.log(
                                this.formRef.current.getFieldsValue().config
                            )
                            let config = this.formRef.current.getFieldsValue()
                                .config
                            if (config) {
                                if (config.node) {
                                    let node = config.node.map(
                                        (item, index) => {
                                            let key = this.handleReFollow(
                                                item.key,
                                                time
                                            )
                                            let action =
                                                item.action &&
                                                item.action.map((one) => {
                                                    return this.handleReFollow(
                                                        one,
                                                        time
                                                    )
                                                })
                                            return { ...item, key, action }
                                        }
                                    )
                                    console.log("node", node)
                                    config.node = node
                                }
                                if (config.action) {
                                    let action = config.action.map(
                                        (item, index) => {
                                            let key = this.handleReFollow(
                                                item.key,
                                                time
                                            )
                                            return { ...item, key }
                                        }
                                    )
                                    console.log("action", action)
                                    config.action = action
                                }
                                if (config.condition) {
                                    let condition = config.condition.map(
                                        (item, index) => {
                                            let key = this.handleReFollow(
                                                item.key,
                                                time
                                            )
                                            return { ...item, key }
                                        }
                                    )
                                    config.condition = condition
                                    console.log("condition", condition)
                                }
                                if (config.connection) {
                                    let connection = config.connection.map(
                                        (item, index) => {
                                            let begin = this.handleReFollow(
                                                item.begin,
                                                time
                                            )
                                            let end = this.handleReFollow(
                                                item.end,
                                                time
                                            )
                                            let key = this.handleReFollow(
                                                item.key,
                                                time
                                            )

                                            let condition =
                                                item.condition &&
                                                item.condition.map((one) => {
                                                    return this.handleReFollow(
                                                        one,
                                                        time
                                                    )
                                                })
                                            return {
                                                ...item,
                                                key,
                                                condition,
                                                begin,
                                                end,
                                            }
                                        }
                                    )
                                    config.connection = connection
                                    console.log("connection", connection)
                                }
                            }
                            this.formRef.current.setFieldsValue({
                                config: undefined,
                            })

                            this.setState({ loadingFetch: true })

                            this.formRef.current.setFieldsValue({
                                config: clone(config),
                            })
                            this.setState({
                                loadingFetch: false,
                                values: {
                                    ...this.state.values,
                                    config: clone(config),
                                },
                            })
                        }}
                    >
                        重新生成KEY
                    </Button>,
                    <Popconfirm
                        title="是否确认提交?"
                        onConfirm={this.handleSave}
                        //   onCancel={cancel}
                        okText="是"
                        cancelText="否"
                    >
                        <Button
                            key="submit"
                            type="primary"
                            loading={this.props.loadingSubmit}
                        >
                            确定
                        </Button>
                    </Popconfirm>,
                ]}
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

export default PureInfoModal
