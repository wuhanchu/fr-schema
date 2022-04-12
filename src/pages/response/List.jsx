import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import schemas from "@/schemas"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import {
    Form,
    Input,
    Modal,
    Button,
    Spin,
    TreeSelect,
    message,
    Tooltip,
} from "antd"
import { autobind } from "core-decorators"
import { globalStyle } from "@/outter/fr-schema-antd-utils/src/styles/global"
import AceEditor from "react-ace"
import frSchema from "@/outter/fr-schema/src"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import { InfoCircleOutlined } from "@ant-design/icons"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
const { actions, getPrimaryKey, decorateList } = frSchema
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/ext-language_tools"
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons"
import { getTree } from "@/pages/Flow/methods"
import ReactMarkdown from "react-markdown"
import TabList from "@/pages/tabList/TabList"
@connect(({ global }) => ({
    dict: global.dict,
}))
@autobind
class List extends TabList {
    formRefs = React.createRef()
    constructor(props) {
        super(props, {
            schema: schemas.response.schema,
            service: schemas.response.service,
            operateWidth: "120px",
            initLocalStorageDomainKey: true,
            showSelect: true,
            showDelete: true,
            infoProps: {
                width: "900px",
            },
        })
        this.schema.domain_key.dict = this.props.dict.domain
        this.state = {
            ...this.state,
            intentList: [],
            allIntentList: [],
            domainList: [],
            modalLoading: false,
        }
    }

    /**
     * 操作栏按钮
     */
    renderOperationButtons() {
        if (this.props.renderOperationButtons) {
            return this.props.renderOperationButtons()
        }

        return (
            <>
                {!this.props.readOnly && !this.meta.addHide && (
                    <Button
                        type="primary"
                        onClick={() =>
                            this.handleVisibleModal(true, null, "add")
                        }
                    >
                        新增
                    </Button>
                )}
                <Button
                    onClick={() => {
                        this.setState({ visibleImport: true })
                    }}
                >
                    导入
                </Button>

                <Button
                    loading={this.state.exportLoading}
                    onClick={() => {
                        // this.setState({ visibleExport: true })
                        this.handleExport()
                    }}
                >
                    导出
                </Button>
            </>
        )
    }

    async handleExport(args, schema) {
        this.setState({ exportLoading: true }, async () => {
            let column = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "external_id"
            })
            let columns = [
                // column[0],
                {
                    title: "名称",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "编码",
                    dataIndex: "key",
                    key: "key",
                },
                {
                    title: "意图",
                    dataIndex: "intent_key",
                    key: "intent_key",
                },
                {
                    title: "实体范围",
                    dataIndex: "expect_entity_scope",
                    key: "expect_entity_scope",
                },
                {
                    title: "回复文本",
                    dataIndex: "template_text",
                    key: "template_text",
                },
                {
                    title: "回复模板",
                    dataIndex: "template",
                    key: "template",
                },
            ]
            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
            })
            let list = data.list
            list = list.map((item) => {
                return {
                    ...item,
                    intent_key: item.intent_key
                        ? JSON.stringify(item.intent_key)
                        : undefined,
                    template_text: item.template_text
                        ? JSON.stringify(item.template_text)
                        : undefined,
                    template: item.template
                        ? JSON.stringify(item.template)
                        : undefined,
                }
            })
            data = decorateList(list, this.schema)
            await exportData("回应", data, columns)
            this.setState({ exportLoading: false })
        })
    }

    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={{
                    // domain_key: {
                    //     title: "域",
                    //     required: true,
                    //     type: "Select",
                    //     dict: this.props.dict.domain,
                    // },
                    name: {
                        title: "名称",
                        rules: (rule, value) => value,
                        required: true,
                    },
                    key: {
                        title: "编码",
                        rules: (rule, value) => value,
                        required: true,
                    },
                    intent_key: {
                        title: "意图",
                    },
                    expect_entity_scope: {
                        title: "实体范围",
                    },
                    template_text: {
                        title: "回复文本",
                    },
                    template: {
                        title: "回复模板",
                    },
                }}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                confirmLoading={this.state.confirmLoading}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    if (this.state.importData) {
                        this.setState({ confirmLoading: true })
                        const data = this.state.importData.map((item) => {
                            return {
                                ...item,
                                intent_key: item.intent_key
                                    ? JSON.parse(item.intent_key)
                                    : [],
                                template_text: item.template_text
                                    ? JSON.parse(item.template_text)
                                    : [],
                                template: item.template
                                    ? JSON.parse(item.template)
                                    : {},
                            }
                        })
                        try {
                            await this.service.upInsert(data)
                            message.success("导入成功")
                            this.setState({
                                visibleImport: false,
                                confirmLoading: false,
                            })
                            this.refreshList()
                        } catch (error) {
                            message.error(error.message)
                            this.setState({
                                confirmLoading: false,
                            })
                        }
                    }
                }}
            />
        )
    }

    handleVisibleImportModal = (flag, record, action) => {
        this.setState({
            visibleImport: !!flag,
            infoData: record,
            action,
        })
    }

    async componentDidMount() {
        await this.findAllIntent()
        this.domainDictToList()
        this.schema.intent_key.render = (text, record) => {
            let str = ""
            if (record.intent_key) {
                let list = record.intent_key
                for (let i = 0; i < list.length; i++) {
                    let item = this.state.allIntentList.find((value) => {
                        return value.key === list[i]
                    })
                    if (item)
                        str += item.name + (i !== list.length - 1 ? "," : "")
                }
            }
            return str
        }
        await this.findIntentByDomainKey(this.state.localStorageDomainKey)
        super.componentDidMount()
    }

    renderSearchBar() {
        ;``
        const { name, key, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
                key,
                // standard_text,
            },
            5
        )
        return this.createSearchBar(filters)
    }

    /**
     * 渲染信息弹出框
     * @param customProps 定制的属性
     * @returns {*}
     */
    renderInfoModal(customProps = {}) {
        let {
            infoData,
            intentList,
            visibleModal,
            domainList,
            modalLoading,
        } = this.state

        const markdown = `**参考配置**

    [{
        "title": "展示文本", //回复选项展示内容
        "payload": "/set_slot{\'templates\':\'t\'}" //回复选项值
    }]
         `

        return (
            <Modal
                width={700}
                visible={visibleModal}
                destroyOnClose
                title={"回应信息"}
                bodyStyle={{ height: "600px", overflow: "auto" }}
                onCancel={(_) => this.setState({ visibleModal: false })}
                onOk={(_) => this.handleSave()}
            >
                <Spin spinning={modalLoading}>
                    <Form
                        ref={this.formRefs}
                        labelCol={{
                            sm: { span: 24 },
                            md: { span: 4 },
                        }}
                        wrapperCol={globalStyle.form.wrapperCol}
                        initialValues={infoData}
                    >
                        <Form.Item
                            label="名称"
                            name="name"
                            rules={[{ required: true, message: "请输入名称" }]}
                        >
                            <Input placeholder="请输入名称" />
                        </Form.Item>
                        <Form.Item
                            label="编码"
                            name="key"
                            extra="域中的唯一编码,可用中文。初始化好了以后，请不要随意修改。"
                            rules={[{ required: true, message: "请输入编码" }]}
                        >
                            <Input placeholder="请输入编码" />
                        </Form.Item>
                        <Form.Item
                            label="意图"
                            name="intent_key"
                            extra="需要回复回应的对应意图。"
                        >
                            <TreeSelect
                                showSearch
                                allowClear
                                multiple
                                treeNodeFilterProp="name"
                                style={{ width: "100%" }}
                                placeholder={"请选择意图"}
                                dropdownStyle={{
                                    maxHeight: 400,
                                    overflow: "auto",
                                }}
                                treeData={intentList}
                                treeDefaultExpandAll
                            />
                        </Form.Item>
                        <Form.Item
                            label="实体范围"
                            name="expect_entity_scope"
                            extra="当前回应返回后，希望客户选择配置的实体范围。"
                        >
                            <Input placeholder="请输入实体范围" />
                        </Form.Item>
                        <Form.Item
                            label="指令"
                            name="instruction"
                            extra="当前回应返回后，调用外部接口的指令。"
                        >
                            <Input placeholder="请输入指令" />
                        </Form.Item>
                        <Form.Item
                            colon={false}
                            label={
                                <div>
                                    <div>回复文本:</div>
                                    <div style={{ color: "#00000073" }}>
                                        话术引擎回复
                                    </div>
                                </div>
                            }
                            name="template_text"
                            extra="可配置多个，会按照顺序进行回复。"
                        >
                            <Input.TextArea placeholder="请输入回复文本" />
                        </Form.Item>
                        <Form.List name="texts">
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            wrapperCol={{
                                                xs: { span: 24, offset: 0 },
                                                sm: { span: 20, offset: 4 },
                                            }}
                                            required={false}
                                            key={field.key}
                                            label=""
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={[
                                                    "onChange",
                                                    "onBlur",
                                                ]}
                                                noStyle
                                            >
                                                <Input.TextArea
                                                    placeholder="请输入回复文本"
                                                    style={{ width: "90%" }}
                                                />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                onClick={() =>
                                                    remove(field.name)
                                                }
                                                style={{
                                                    position: "relative",
                                                    top: "0",
                                                    marginLeft: "8px",
                                                    color: "#999",
                                                    fontSize: "24px",
                                                    cursor: "pointer",
                                                    transition: "all 0.3s",
                                                }}
                                            />
                                        </Form.Item>
                                    ))}
                                    <Form.Item
                                        wrapperCol={{
                                            xs: { span: 24, offset: 0 },
                                            sm: { span: 20, offset: 4 },
                                        }}
                                    >
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{ width: "60%" }}
                                            icon={<PlusOutlined />}
                                        >
                                            添加新的回复文本
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item
                            colon={false}
                            extra="回复时展示的按钮，为数组类型，可配置多个。"
                            label={
                                <div>
                                    <div>按钮:</div>
                                </div>
                            }
                            name="buttons"
                        >
                            {this.renderAce("buttons")}
                            <Tooltip
                                overlayStyle={{ width: "460px" }}
                                overlayInnerStyle={{
                                    width: "460px",
                                }}
                                title={
                                    <ReactMarkdown>{markdown}</ReactMarkdown>
                                }
                            >
                                {/* <a> */}
                                <InfoCircleOutlined
                                    style={{
                                        position: "absolute",
                                        right: "-20px",
                                        top: "10px",
                                        marginLeft: "5px",
                                    }}
                                />
                                {/* </a> */}
                            </Tooltip>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        )
    }

    renderAce(key = "buttons") {
        let { infoData, AceEditorValue } = this.state
        if (infoData[key]) {
            AceEditorValue = JSON.stringify(infoData[key], null, "\t")
        }
        if (
            this.form &&
            this.form.current &&
            this.form.current.getFieldsValue()[key]
        ) {
            if (typeof this.form.current.getFieldsValue()[key] === "object") {
                AceEditorValue = JSON.stringify(
                    this.form.current.getFieldsValue()[key],
                    null,
                    "\t"
                )
            } else {
                AceEditorValue = this.form.current.getFieldsValue()[key]
            }
        }
        return (
            <div>
                <AceEditor
                    placeholder={`请输入展示按钮`}
                    mode="json"
                    theme="tomorrow"
                    name="blah2"
                    wrapEnabled={true}
                    onChange={(res) => {
                        const obj = {}
                        obj[key] = res
                        try {
                            this.formRefs.current.setFieldsValue(obj)
                        } catch (error) {
                            console.info("error", error)
                        }
                    }}
                    fontSize={14}
                    showPrintMargin
                    showGutter
                    style={{ width: "476px" }}
                    height={"400px"}
                    highlightActiveLine
                    value={AceEditorValue}
                    markers={[
                        {
                            startRow: 0,
                            startCol: 2,
                            endRow: 1,
                            endCol: 20,
                            className: "error-marker",
                            type: "background",
                        },
                    ]}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                        useWorker: false,
                    }}
                />
            </div>
        )
    }

    filterOption(value, option) {
        let { intentList } = this.state
        let list = intentList.filter((item) => {
            return item.name.includes(value)
        })
        return list
    }

    /**
     * 信息界面展示
     * @param flag
     * @param record
     * @param action
     */
    handleVisibleModal = async (flag, record, action) => {
        let { infoData } = this.state
        infoData = {}
        if (action === "edit") {
            infoData = JSON.parse(JSON.stringify(record))

            infoData.intent_key = infoData.intent_key || undefined
            await this.findIntentByDomainKey(record.domain_key)
            if (infoData.template_text && infoData.template_text.length > 1) {
                infoData.texts = infoData.template_text.splice(1)
                infoData.template_text = infoData.template_text.toString()
            }
        }
        this.setState({
            visibleModal: !!flag,
            infoData,
            action,
        })
    }

    domainKeyChange = (item) => {
        if (this.meta.initLocalStorageDomainKey) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: item,
            }
            this.findIntentByDomainKey(item)
        }
    }
    /**
     * 确认保存
     */
    handleSave = () => {
        const { values, infoData, action, addArgs } = this.state
        this.setState({ loadingSubmit: true })
        this.formRefs.current
            .validateFields()
            .then(async (fieldsValue) => {
                this.setState({ modalLoading: true })
                let param = addArgs ? { ...addArgs } : {}
                const idKey = getPrimaryKey(this.schema)
                // set the id value
                if (values) {
                    const idValue = values[idKey || "id"]
                    idValue && (param[idKey] = idValue)
                }
                let { texts, template_text, ...other } = fieldsValue
                // 新的回复文本

                if (fieldsValue["texts"] && fieldsValue["texts"].length) {
                    // 判断是否需要插入
                    if (fieldsValue["template_text"])
                        if (typeof fieldsValue["template_text"] === "string") {
                            fieldsValue["template_text"] = [
                                fieldsValue["template_text"],
                                ...fieldsValue["texts"],
                            ]
                        } else {
                            fieldsValue["template_text"] = [
                                ...fieldsValue["template_text"],
                                ...fieldsValue["texts"],
                            ]
                        }
                } else {
                    if (
                        fieldsValue["template_text"] &&
                        typeof fieldsValue["template_text"] === "object"
                    ) {
                        fieldsValue["template_text"] =
                            fieldsValue["template_text"]
                    } else {
                        fieldsValue["template_text"] = fieldsValue[
                            "template_text"
                        ]
                            ? [fieldsValue["template_text"]]
                            : []
                    }
                }
                param["template_text"] = fieldsValue["template_text"]
                if (action === actions.edit) {
                    param.id = infoData.id
                    await this.handleUpdate(
                        { ...fieldsValue, ...param, texts: undefined },
                        this.schema
                    )
                } else {
                    await this.handleAdd(
                        { ...fieldsValue, ...param, texts: undefined },
                        this.schema
                    )
                }
            })
            .catch((err) => {
                console.log("err", err)
            })
            .finally((_) => {
                this.setState({ loadingSubmit: false, modalLoading: false })
            })
    }

    // 获取意图列表
    async findIntentList(domainKey) {
        if (domainKey) {
            let domainArray = []
            domainArray.push(domainKey)
            let base_domain_key = this.props.dict.domain[domainKey]
                .base_domain_key
            if (base_domain_key) {
                domainArray = [...domainArray, ...base_domain_key]
            }
            let res = await schemas.intent.service.get({
                domain_key: domainArray.join(","),
                pageSize: 10000,
            })
            return res.list
        } else {
            let res = await schemas.intent.service.get({
                pageSize: 10000,
            })
            return res.list
        }
    }

    async findAllIntent() {
        let list = await this.findIntentList()
        this.setState({ allIntentList: list })
    }

    async findIntentByDomainKey(domainKey) {
        let list = await this.findIntentList(domainKey)
        let treeList = getTree(list, this.props.dict.domain)
        this.setState({ intentList: treeList })
    }

    // 域字典->列表
    domainDictToList(key = "key") {
        let dict = this.props.dict.domain
        let list = []
        for (let item in dict) {
            list.push({ value: dict[item][key], label: dict[item].remark })
        }
        this.setState({ domainList: [...list] })
    }
}

export default List
