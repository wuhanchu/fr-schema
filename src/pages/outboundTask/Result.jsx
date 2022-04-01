import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Divider, Button, message, Modal } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { listToDict } from "@/outter/fr-schema/src/dict"
import ImportModal from "./ImportModal"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import FileSaver from "file-saver"
import ConversationDetail from "@/pages/outPage/ConversationDetail"
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
            showDelete: false,
            showEdit: false,
            search: {
                span: 6,
            },
            queryArgs: {
                outbound_task_id: props.task_id,
            },
            initLocalStorageDomainKey: true,
            operateWidth: "60px",
            addHide: true,
        })
    }

    async componentDidMount() {
        super.componentDidMount()
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                <a
                    onClick={() => {
                        this.setState({ showInfo: true, record })
                    }}
                >
                    详情
                </a>
            </>
        )
    }
    renderExtend() {
        const { record, showInfo } = this.state
        return (
            <>
                {showInfo && (
                    <Modal
                        visible={showInfo}
                        title="会话详情"
                        onCancel={(_) => this.setState({ showInfo: false })}
                        footer={null}
                        width="90%"
                        destroyOnClose
                    >
                        <ConversationDetail
                            conversation_id={
                                "77bfe6a1-ae3f-11ec-b0df-0242ac110017"
                            }
                            flow_key={record.flow_key}
                            domain_key={record.domain_key}
                            roomHeight="60vh"
                            // create_time={record.create_time}
                            showIntentFlow={true}
                        />
                    </Modal>
                )}
            </>
        )
    }
}

export default List
