import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { message, Modal } from "antd"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.relationType.schema,
            service: schemas.relationType.service,
            operateWidth: "100px",
        })
        this.schema.domain_key.dict = this.props.dict.domain
    }

    handleUpdate = async (data, schema, method = "patch") => {
        // 更新
        if (this.state.infoData.key === data.key) {
            let response = await this.service[method](data, schema)
            this.refreshList()
            message.success("修改成功")
            this.handleVisibleModal()
            this.handleChangeCallback
            return response
        } else {
            Modal.confirm({
                title: "修改编码会导致大量数据不可用！",
                okText: "确认提交",
                onCancel: () => {
                    this.setState({
                        showConfirm: false,
                        showConfirmLoading: false,
                    })
                },
                cancelText: "取消",
                onOk: async () => {
                    let response = await this.service[method](data, schema)
                    this.refreshList()
                    message.success("修改成功")
                    this.handleVisibleModal()
                    this.handleChangeCallback
                    return response
                },
            })
        }
    }

    renderSearchBar() {
        const { name, key, regex, domain_key } = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
                key,
                regex,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
