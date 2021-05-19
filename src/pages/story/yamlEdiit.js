import React, { Component } from "react"
import CodeMirror from "react-codemirror"
import Modal from "antd/lib/modal/Modal"
import { message } from "antd"
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

class yamlEdiit extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.record.content && props.record.content.story_text,
        }
        this.handleChange = this.handleChange.bind(this)
        console.log(props)
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
                title={"内容"}
                width={"70%"}
                okText={"确定"}
                cancelText={"取消"}
                onCancel={() => {
                    this.props.handleSetYamlEditVisible(false)
                }}
                onOk={() => {
                    let isYaml = false
                    let errorMessage = ""
                    try {
                        isYaml = !!jsyaml.load(this.state.value)
                        let record = {
                            content: this.props.record.content || {},
                            id: this.props.record.id,
                        }
                        record.content.story_text = this.state.value
                        this.props.service.patch(record)
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
