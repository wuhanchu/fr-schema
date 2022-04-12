import { connect } from "dva"
import schemas from "@/schemas"
import React from "react"
import "@ant-design/compatible/assets/index.css"
import clientService from "@/pages/authority/clientList/service"
import { listToDict } from "@/outter/fr-schema/src/dict"
import userService from "@/pages/authority/user/service"
import ReactJson from "react-json-view"
import TabList from "@/pages/tabList/TabList";

@connect(({ global }) => ({
    dict: global.dict,
}))
class List extends TabList {
    constructor(props) {
        super(props, {
            schema: schemas.log.schema,
            service: schemas.log.service,
            operateWidth: "170px",
            readOnly: true,
            addHide: true,
        })
    }
    async componentDidMount() {
        await this.findUserList()
        let resClient = await clientService.get({ limit: 1000 })
        this.schema.client_id.dict = listToDict(
            resClient.list,
            null,
            "client_id",
            "client_name"
        )
        super.componentDidMount()
    }

    // 流程列表-> 列表枚举展示
    async findUserList() {
        let res = await userService.get({ pageSize: 10000, select: "id, name" })
        this.schema.user_id.dict = listToDict(res.list, null, "id", "name")
    }

    renderList() {
        const tableProps = {
            expandable: {
                expandedRowRender: (record) => (
                    <ReactJson
                        indentWidth={2}
                        displayDataTypes={false}
                        src={{
                            headers: record.headers,
                            args: record.args,
                            remote_addr: record.remote_addr,
                        }}
                        theme="monokai"
                    />
                ),
                defaultExpandAllRows: false,
            },
        }
        return super.renderList(tableProps)
    }
}

export default List
