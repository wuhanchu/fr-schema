import React from "react"
import { autobind } from "core-decorators"
import Chat from "@/pages/question/components/Chat"

@autobind
class WorkDetail extends Chat {
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
        }
        this.editRef = React.createRef()
    }
}

export default WorkDetail
