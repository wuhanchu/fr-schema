import React from "react"
import service from "@/schemas/domain/index"
import IntentService from "@/schemas/intent/index"
import {
    Spin,
    Modal,
    Button,
    Input,
    Card,
    Form,
    Checkbox,
    Table,
    message,
} from "antd"
import { formatData } from "@/utils/utils"
import clone from "clone"
import { connect } from "dva"

@connect(({ global, user }) => ({
    dict: global.dict,
}))
class IntentIdentify extends React.Component {
    state = {
        result: [],
        changeRow: [],
        loading: true,
        success: false,
        isSpin: false,
    }
    formRef = React.createRef()

    componentDidMount() {
        if (this.props.text) {
            this.onFinish({ text: this.props.text })
        }
    }

    getRow() {
        const { list } = this.state
        let changeRow =
            list &&
            list.filter((item) => {
                return item.addTxt || item.isDel
            })
        this.setState({ changeRow })
    }

    onFinish = async (values) => {
        this.setState({
            data: {},
            isSpin: true,
            list: [],
            result: [],
        })
        if (values.text) {
            let response = await service.service.intentIdentify({
                domain_key: this.props.record.key,
                text: values.text,
            })
            let list = response.data.intent_ranking.map((item, index) => {
                return { ...item, isTrue: false, isDel: false, addTxt: "" }
            })

            console.log(response.data.intent_ranking)
            this.setState({
                data: response.data,
                isSpin: false,
                list: clone(response.data.intent_ranking),
            })
        }
        this.setState({ isSpin: false })
    }

    renderContent() {
        const onFinishFailed = (errorInfo) => {
            console.log("Failed:", errorInfo)
        }

        return (
            <>
                <div>
                    <Form
                        name="basic"
                        layout={"inline"}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        ref={this.formRef}
                        initialValues={{
                            remember: true,
                            text: this.props.text,
                        }}
                        onFinish={this.onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            label="解析文本"
                            name="text"
                            // rules={[
                            //     { required: true, message: "请输入对话文本" },
                            // ]}
                        >
                            <Input
                                placeholder={"请输入对话文本"}
                                style={{ width: "400px" }}
                                disabled={this.props.text}
                            />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ width: "200px" }}>
                                <Button
                                    style={{
                                        marginRight: "4px",
                                        marginLeft: "-4px",
                                    }}
                                    type="primary"
                                    htmlType="submit"
                                    disabled={this.props.text}
                                >
                                    查询
                                </Button>
                                <Button
                                    disabled={this.props.text}
                                    onClick={() => {
                                        this.setState({
                                            result: [],
                                            changeRow: [],
                                            loading: true,
                                            success: false,
                                            isSpin: false,
                                            list: [],
                                        })
                                        this.formRef.current.resetFields()
                                    }}
                                >
                                    重置
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
                <div style={{ marginTop: "24px" }}>{this.renderTable()}</div>
            </>
        )
    }

    renderTable() {
        const columns = [
            {
                title: "名称",
                fixed: "left",
                dataIndex: "name",
                key: "name",
                render: (text) => <span>{text}</span>,
            },
            {
                title: "匹配类型",
                dataIndex: "type",
                fixed: "left",
                key: "type",
                render: (text, item) => (
                    <span>
                        {this.props.dict.intent_from[item.from] &&
                            this.props.dict.intent_from[item.from].name}
                    </span>
                ),
            },
            {
                title: "匹配字符",
                dataIndex: "match_standard_discourse",
                key: "match_standard_discourse",
                render: (text, item) => (
                    <span>
                        {item.match_standard_discourse || item.match_regex}
                    </span>
                ),
            },
            {
                title: "匹配度",
                dataIndex: "compatibility",
                key: "compatibility",
                fixed: "right",
                render: (text) => <span>{formatData(text, 5)}</span>,
            },
            {
                title: "新增配置文本",
                key: "addTxt",
                fixed: "right",
                dataIndex: "addTxt",
                render: (addTxt, record, index) => (
                    <>
                        <Input
                            onChange={(e) => {
                                const { list } = this.state
                                list[index] = {
                                    ...record,
                                    addTxt: e.target.value,
                                }
                                this.setState({
                                    list: list,
                                })
                                this.getRow()
                            }}
                            value={addTxt}
                            placeholder={"输入文本"}
                        />
                    </>
                ),
            },
            {
                title: "删除匹配",
                key: "isDel",
                fixed: "right",
                dataIndex: "isDel",
                render: (isDel, record, index) => {
                    return (
                        <>
                            <Checkbox
                                onChange={(value) => {
                                    const { list } = this.state
                                    list[index] = {
                                        ...record,
                                        isDel: value.target.checked,
                                    }
                                    this.setState({
                                        list: list,
                                    })
                                    this.getRow()
                                }}
                                checked={isDel}
                            />
                        </>
                    )
                },
            },
        ]
        console.log(this.state.list)
        return (
            <Spin spinning={this.state.isSpin}>
                <Table
                    size="small"
                    columns={columns}
                    dataSource={clone(this.state.list) || []}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                />
            </Spin>
        )
    }

    handleSubmit = async () => {
        const { changeRow } = this.state
        let data = changeRow.map((item) => {
            return {
                domain_key: this.props.record.key,
                intent_key: item.key,
                add_text: item.addTxt,
                remove_text:
                    item.isDel &&
                    (item.match_standard_discourse || item.match_regex),
            }
        })
        try {
            await IntentService.service.submit(data)
            let values = await this.formRef.current.validateFields()
            message.success("提交成功")
            this.onFinish(values)
            // this.props.onCancel(false)
        } catch (error) {
            message.error(error.message)
            this.setState({ isSpin: false })
        }
    }

    render() {
        const { changeRow } = this.state
        return (
            <>
                {
                    <Modal
                        visible
                        onCancel={() => this.props.onCancel(false)}
                        title="意图识别"
                        footer={false}
                        onOk={() => {
                            this.setState({
                                result: [],
                                loading: true,
                                success: false,
                            })
                        }}
                        width={"1100px"}
                        maskClosable
                    >
                        <Card
                            bordered={false}
                            bodyStyle={{ marginBottom: "0px" }}
                        >
                            {this.renderContent()}
                            {/* <div><Button style={{position: 'absolute', right: '-10px', bottom: '-14px'}}>提交</Button></div> */}
                            {changeRow.length ? (
                                <Button
                                    onClick={this.handleSubmit}
                                    type={"primary"}
                                    style={{
                                        position: "absolute",
                                        right: "-10px",
                                        bottom: "-14px",
                                    }}
                                >
                                    提交
                                </Button>
                            ) : (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: "-10px",
                                        bottom: "-14px",
                                        height: "32px",
                                        width: "100%",
                                    }}
                                />
                            )}
                        </Card>
                    </Modal>
                }
            </>
        )
    }
}

export default IntentIdentify
