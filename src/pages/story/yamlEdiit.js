import React, { Component } from "react"
import CodeMirror from "react-codemirror"
import { message, Modal } from "antd"
import "codemirror/lib/codemirror.css"
import "codemirror/mode/yaml/yaml"
import "codemirror/theme/neat.css"
import "codemirror/addon/fold/foldgutter.css"
import "codemirror/addon/lint/lint.css"
import "codemirror/theme/monokai.css"
import "codemirror/addon/lint/lint"
import "codemirror/addon/lint/yaml-lint"
import jsyaml from "js-yaml"

window.jsyaml = require("js-yaml")

const confirm = Modal.confirm

class yamlEdiit extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.record && props.record[props.schemasName],
        }
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(value) {
        this.setState({ value: value })
    }

    render() {
        const options = {
            theme: "neat",
            mode: "text/x-yaml",
            gutters: ["CodeMirror-lint-markers"], // 语法检查器
            lint: true, // 开启语法检查
            readOnly: false,
            lineNumbers: true,
            lineWrapping: true,
        }
        const { value } = this.state

        return (
            <Modal
                visible={true}
                title={this.props.title}
                width={"70%"}
                okText={"确定"}
                cancelText={"取消"}
                onCancel={() => {
                    console.log(this.props.record)
                    console.log(
                        value === this.props.record[this.props.schemasName]
                    )
                    if (value === this.props.record[this.props.schemasName]) {
                        this.props.handleSetYamlEditVisible(false)
                        return
                    }
                    confirm({
                        title: "提示",
                        content: "关闭对话框将不会保留未确认内容！",
                        okText: "关闭",
                        cancelText: "取消",
                        onOk: () => {
                            this.props.handleSetYamlEditVisible(false)
                        },
                        onCancel: () => {
                            return
                        },
                    })
                }}
                onOk={async () => {
                    let isYaml = false
                    let errorMessage = ""
                    try {
                        isYaml = !!jsyaml.load(this.state.value)
                        let record = {
                            id: this.props.record.id,
                        }
                        record[this.props.schemasName] = this.state.value
                        await this.props.service.patch(record)
                        message.success("修改成功")
                        this.props.refreshList()
                        this.props.handleSetYamlEditVisible(false)
                    } catch (e) {
                        errorMessage = e && e.message
                        message.error("语法错误！")
                    }

                    return {
                        isYaml,
                        errorMessage,
                    }
                }}
            >
                <div style={{ height: "550px", position: "relative" }}>
                    <CodeMirror
                        value={value}
                        options={options}
                        onChange={this.handleChange}
                    />
                </div>
            </Modal>
        )
    }
}

export default yamlEdiit
