import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Divider, Button, message } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { listToDict } from "@/outter/fr-schema/src/dict"
import ImportModal from "./ImportModal"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import FileSaver from "file-saver"

import XLSX from "xlsx"
import { convertFormImport } from "@/outter/fr-schema/src/schema"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.taskResult.schema,
            service: schemas.taskResult.service,
            showDelete: true,
            showSelect: true,
            initLocalStorageDomainKey: true,
            operateWidth: "170px",
            readOnly: true,
            addHide: true,
        })
    }

    async componentDidMount() {
        super.componentDidMount()
    }
}

export default List
