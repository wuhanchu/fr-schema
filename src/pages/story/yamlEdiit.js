import React, { Component } from "react"
import CodeMirror from "react-codemirror"
import Modal from "antd/lib/modal/Modal"
import { message } from "antd"
import "codemirror/lib/codemirror.css"
import "codemirror/mode/yaml/yaml"
import "codemirror/theme/neat.css"
import "codemirror/addon/fold/foldgutter.css"
import jsyaml from "js-yaml"

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
        // const encodeValue = value.replace(" ", "&nbsp;");
        this.setState({ value: value })
    }

    render() {
        const options = {
            theme: "neat",
            mode: "text/x-yaml",
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
                        console.log(isYaml)
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
                        message.error("格式错误：" + errorMessage)
                    }

                    return {
                        isYaml,
                        errorMessage,
                    }
                }}
            >
                <div style={{ height: "550px" }}>
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
