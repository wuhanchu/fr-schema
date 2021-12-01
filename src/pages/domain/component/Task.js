import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"
import { listToDict } from "@/outter/fr-schema/src/dict"
import Modal from "antd/lib/modal/Modal"
import { Card, message, Progress } from "antd"

const { utils } = frSchema

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends React.Component {
    constructor(props) {
        super(props, {
            schema: schemas.task.schema,
            service: schemas.task.service,
            infoProps: {
                width: "100px",
            },
            showEdit: false,
            showDelete: false,
            readOnly: true,
            addHide: true,
            queryArgs: {
                ...props.queryArgs,
                domain_key: props.domain_key,
            },
        })
    }

    async componentDidMount() {
        this.mysetIntervals = setInterval(async () => {
            let res = await schemas.task.service.get({
                domain_key: this.props.domain_key,
                order: "create_time.desc",
            })
            let data = res.list && res.list[0]
            if (data) {
                if (data.status === "end") {
                    const args = {
                        message: "已完成",
                        description: "训练已完成",
                        duration: 0,
                    }
                    clearInterval(this.mysetIntervals)
                } else {
                    this.setState({ process: data.process })
                }
            } else {
                clearInterval(this.mysetIntervals)
            }
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.mysetIntervals)
    }

    render() {
        return (
            <Card>
                <Progress
                    type="circle"
                    percent={(this.state && this.state.process) || 0}
                />
            </Card>
        )
    }
}

export default List
