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
    Tabs,
} from "antd"
import { formatData } from "@/utils/utils"
import SearchPage from "@/pages/question/components/SearchPage"
import clone from "clone"
import { connect } from "dva"
import { listToDict } from "@/outter/fr-schema/src/dict"
const { TabPane } = Tabs

@connect(({ global, user }) => ({
    dict: global.dict,
    user: user,
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

    async componentDidMount() {
        console.log(this.props.user.currentUser.loginid === "admin")
        if (this.props.user.currentUser.loginid !== "admin") {
            let domainArray = await service.service.getUserDomain({
                limit: 1000,
                user_id: this.props.user.currentUser.id,
            })
            // console.log(listToDict(domainArray.list, '', "domain_key",'name'))
            this.setState({
                domianList: listToDict(
                    domainArray.list,
                    "",
                    "domain_key",
                    "name"
                ),
            })
        }

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
                        <Form.Item label="解析文本" name="text">
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
                                console.log(addTxt, record, index)
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
                            disabled={
                                this.props.user.currentUser.loginid !== "admin"
                                    ? !this.state.domianList[record.domain_key]
                                    : false
                            }
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
                                        isDel:
                                            value.target.checked === true
                                                ? true
                                                : undefined,
                                    }
                                    this.setState({
                                        list: list,
                                    })
                                    this.getRow()
                                }}
                                disabled={
                                    this.props.user.currentUser.loginid !==
                                    "admin"
                                        ? !this.state.domianList[
                                              record.domain_key
                                          ]
                                        : false
                                }
                                checked={isDel}
                            />
                        </>
                    )
                },
            },
        ]
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
                add_text: !item.isDel ? item.addTxt : undefined,
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

    renderCard() {
        const { changeRow } = this.state
        return (
            <Card bordered={false} bodyStyle={{ marginBottom: "0px" }}>
                {this.renderContent()}
                {/* <div><Button style={{position: 'absolute', right: '-10px', bottom: '-14px'}}>提交</Button></div> */}
                {changeRow.length ? (
                    <Button
                        onClick={this.handleSubmit}
                        type={"primary"}
                        style={{
                            position: "absolute",
                            right: "0px",
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
        )
    }

    renderTabs() {
        const { record, text } = this.props
        console.log(record)
        console.log(
            "基础域是",
            this.props.dict.domain[record.key].base_domain_key
        )
        return (
            <Tabs defaultActiveKey="1" style={{ marginTop: "-13px" }}>
                <TabPane
                    style={{ marginBottom: "14px" }}
                    tab="意图识别"
                    key="1"
                >
                    {this.renderCard()}
                </TabPane>
                <TabPane tab="数据搜索" key="2">
                    <SearchPage
                        // type={"domain_id"}
                        onCancel={() => {
                            this.setState({ showAnswer: false })
                        }}
                        dict={this.props.dict}
                        searchProject={this.props.searchProject}
                        height={"600px"}
                        title={"数据搜索" + "(" + text + ")"}
                        record={{
                            ...record,
                            domain_key: record.key,
                            search: text,
                            base_domain_key: this.props.dict.domain[record.key]
                                .base_domain_key,
                        }}
                        // data={data}
                    />
                </TabPane>
            </Tabs>
        )
    }

    render() {
        const { changeRow } = this.state
        return (
            <>
                {
                    <Modal
                        visible
                        onCancel={() => this.props.onCancel(false)}
                        title={this.props.type === "tabs" ? null : "意图识别"}
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
                        {this.props.type === "tabs"
                            ? this.renderTabs()
                            : this.renderCard()}
                    </Modal>
                }
            </>
        )
    }
}

export default IntentIdentify
