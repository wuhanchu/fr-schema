import {connect} from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import {Form, Select, Input, Modal, Button} from 'antd';
import {autobind} from 'core-decorators';
import {globalStyle} from "@/outter/fr-schema-antd-utils/src/styles/global";
import AceEditor from 'react-ace';
import frSchema from "@/outter/fr-schema/src";

const {actions, getPrimaryKey} = frSchema
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import {PlusOutlined, MinusCircleOutlined} from '@ant-design/icons';

@connect(({global}) => ({
    dict: global.dict,
}))
@autobind
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.response.schema,
            service: schemas.response.service,
            operateWidth: "120px",
            infoProps: {
                width: "900px",
            },
        })
        this.schema.domain_key.dict = this.props.dict.domain;
        this.state = {
            ...this.state,
            intentList: [],
            domainList: [],
        }

    }

    async componentDidMount() {
        this.domainDictToList()
        super.componentDidMount();
    }

    renderSearchBar() {
        const {name, key, domain_key} = this.schema
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
        let {infoData, intentList, visibleModal, domainList} = this.state;
        return (
            <Modal
                width={700}
                visible={visibleModal}
                destroyOnClose
                title={"回应信息"}
                onCancel={_ => this.setState({visibleModal: false})}
                onOk={_ => this.handleSave()}
            >
                <Form
                    ref={this.formRef}
                    labelCol={{
                        sm: {span: 24},
                        md: {span: 4}
                    }}
                    wrapperCol={globalStyle.form.wrapperCol}
                    initialValues={infoData}
                >
                    <Form.Item
                        label="域"
                        name="domain_key"
                        rules={[{required: true, message: '请选择域'}]}
                    >
                        <Select onChange={(value) => this.findIntentList(value)} placeholder="请选择域">
                            {domainList.map((item) => (
                                <Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="名称"
                        name="name"
                        rules={[{required: true, message: '请输入名称'}]}
                    >
                        <Input placeholder="请输入名称"/>
                    </Form.Item>
                    <Form.Item
                        label="编码"
                        name="key"
                        rules={[{required: true, message: '请输入编码'}]}
                    >
                        <Input placeholder="请输入编码"/>
                    </Form.Item>
                    <Form.Item
                        label="意图"
                        name="intent_key"
                    >
                        <Select mode="tags" placeholder="请选择意图">
                            {intentList.map((item) => (
                                <Select.Option value={item.key} key={item.id}>{item.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="回复文本"
                        name="templateText"
                    >
                        <Input.TextArea placeholder="请输入回复文本"/>
                    </Form.Item>
                    <Form.List
                        name="texts"
                    >
                        {(fields, {add, remove}, {errors}) => (
                            <>
                                {fields.map((field, index) => (
                                    <Form.Item
                                        wrapperCol={{
                                            xs: {span: 24, offset: 0},
                                            sm: {span: 20, offset: 4},
                                        }}
                                        required={false}
                                        key={field.key}
                                        label=""
                                    >
                                        <Form.Item
                                            {...field}
                                            validateTrigger={['onChange', 'onBlur']}
                                            noStyle
                                        >
                                            <Input.TextArea placeholder="请输入回复文本" style={{width: '90%'}}/>
                                        </Form.Item>
                                        <MinusCircleOutlined
                                            onClick={() => remove(field.name)}
                                            style={{
                                                position: 'relative',
                                                top: '0',
                                                marginLeft: '8px',
                                                color: '#999',
                                                fontSize: '24px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </Form.Item>
                                ))}
                                <Form.Item
                                    wrapperCol={{
                                        xs: {span: 24, offset: 0},
                                        sm: {span: 20, offset: 4},
                                    }}
                                >
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        style={{width: '60%'}}
                                        icon={<PlusOutlined/>}
                                    >
                                        添加新的回复文本
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <Form.Item
                        label="模板"
                        name="template"
                    >
                        {this.renderAce('template')}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }

    renderAce(key = 'template') {
        let {infoData, AceEditorValue} = this.state;
        if (infoData[key]) {
            AceEditorValue = JSON.stringify(infoData[key], null, '\t');
        }
        if (this.form && this.form.current && this.form.current.getFieldsValue()[key]) {
            if (typeof this.form.current.getFieldsValue()[key] === 'object') {
                AceEditorValue = JSON.stringify(
                    this.form.current.getFieldsValue()[key],
                    null,
                    '\t',
                );
            } else {
                AceEditorValue = this.form.current.getFieldsValue()[key];
            }
        }
        return (
            <div>
                <AceEditor
                    placeholder={`请输入模板`}
                    mode="json"
                    theme="tomorrow"
                    name="blah2"
                    wrapEnabled={true}
                    onChange={(res) => {
                        const obj = {};
                        obj[key] = res;
                        try {
                            this.formRef.current.setFieldsValue(obj);
                        } catch (error) {
                            console.info('error', error)
                        }
                    }}
                    fontSize={14}
                    showPrintMargin
                    showGutter
                    style={{width: '500px'}}
                    height={'400px'}
                    highlightActiveLine
                    value={AceEditorValue}
                    markers={[
                        {
                            startRow: 0,
                            startCol: 2,
                            endRow: 1,
                            endCol: 20,
                            className: 'error-marker',
                            type: 'background',
                        },
                    ]}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                    }}
                />
            </div>
        )
    }

    /**
     * 信息界面展示
     * @param flag
     * @param record
     * @param action
     */
    handleVisibleModal = async (flag, record, action) => {
        let {infoData} = this.state;
        infoData = JSON.parse(JSON.stringify(record))
        if (action === 'edit') {
            await this.findIntentList(record.domain_key);
            if (infoData.template_text && infoData.template_text.length > 1) {
                infoData.texts = infoData.template_text.splice(1)
                infoData.templateText = infoData.template_text.toString();
            }
        }
        this.setState({
            visibleModal: !!flag,
            infoData,
            action,
        })
    }

    /**
     * 确认保存
     */
    handleSave = () => {
        const {action, addArgs} = this.state
        const {values, infoData} = this.state

        this.setState({loadingSubmit: true})

        this.formRef.current
            .validateFields()
            .then(async fieldsValue => {
                let param = addArgs ? {...addArgs} : {}
                const idKey = getPrimaryKey(this.schema)

                // set the id value
                if (values) {
                    const idValue = values[idKey || "id"]
                    idValue && (param[idKey] = idValue)
                }
                let {texts, templateText, ...other} = fieldsValue;
                if (fieldsValue['texts']) {
                    fieldsValue['texts'].unshift(fieldsValue['templateText'])
                    fieldsValue['template_text'] = fieldsValue['texts']
                } else {
                    fieldsValue['template_text'] = fieldsValue['templateText'] ? [fieldsValue['templateText']] : []
                }

                Object.keys(other).forEach(key => {
                    param[key] =
                        fieldsValue[key] instanceof Array &&
                        fieldsValue[key][0] instanceof String
                            ? fieldsValue[key].join(",")
                            : fieldsValue[key]
                })
                param['template_text'] = fieldsValue['template_text']

                if (action === actions.edit) {
                    param.id = infoData.id;
                    await this.handleUpdate(param, this.schema)
                } else {
                    await this.handleAdd(param, this.schema)
                }
            })
            .catch(err => {
                console.log("err", err)
            }).finally(_ => {
            this.setState({loadingSubmit: false})
        })
    }

    // 获取意图列表
    async findIntentList(domainKey) {
        this.formRef.current.setFieldsValue({intent_key: undefined})
        let res = await schemas.intent.service.get({domain_key: domainKey, pageSize: 10000})
        this.setState({intentList: res.list})
    }

    // 域字典->列表
    domainDictToList(key = 'key') {
        let dict = this.props.dict.domain
        let list = [];
        for (let item in dict) {
            list.push({value: dict[item][key], label: dict[item].remark});
        }
        this.setState({domainList: [...list]})
    }
}

export default List
