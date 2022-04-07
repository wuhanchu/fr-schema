import { connect } from "dva"
import ListPage from "@/components/ListPage/ListPage"
import {
    DownCircleFilled,
    PlaySquareOutlined,
    SyncOutlined,
    DownloadOutlined,
} from "@ant-design/icons"
import schemas from "@/schemas"
import React from "react"
import { Divider, Button, message, Modal, Row, Col, Popconfirm } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { listToDict } from "@/outter/fr-schema/src/dict"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import FileSaver from "file-saver"
import ConversationDetail from "@/pages/outPage/ConversationDetail"
import XLSX from "xlsx"
import { convertFormImport } from "@/outter/fr-schema/src/schema"
import clone from "clone"

function unique(arr, key) {
    if (!arr) return arr
    if (key === undefined) return [...new Set(arr)]
    const map = {
        string: (e) => e[key],
        function: (e) => key(e),
    }
    const fn = map[typeof key]
    const obj = arr.reduce((o, e) => ((o[fn(e)] = e), o), {})
    return Object.values(obj)
}

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        let schema = clone(schemas.taskResult.schema)
        schema.outbound_task_id.search = true
        schema.outbound_task_id.hideInTable = false
        schema.flow_key.search = true
        schema.flow_key.hideInTable = false
        super(props, {
            schema: schema,
            service: schemas.taskResult.service,
            showDelete: false,
            showEdit: false,
            showSelect: props.task_id,
            search: {
                span: 6,
            },
            queryArgs: {
                outbound_task_id: props.task_id,
            },
            initLocalStorageDomainKey: true,
            operateWidth: "180px",
            addHide: true,
        })
    }

    async componentDidMount() {
        let audio = document.createElement("AUDIO")
        let outbound_task_id = await schemas.outboundTask.service.get({
            limit: 10000,
        })
        this.schema.outbound_task_id.dict = listToDict(
            outbound_task_id.list,
            "",
            "id",
            "name"
        )
        this.setState({
            audio: audio,
        })
        let batchArray = await this.service.getBatch({ limit: 1000 })
        this.schema.batch_id.dict = listToDict(
            batchArray.list,
            "",
            "external_id",
            "create_time"
        )
        let flow = await schemas.flow.service.get({
            limit: 1000,
            select: "id, key, domain_key, name",
            domain_key: this.state.localStorageDomainKey,
        })
        this.schema.flow_key.dict = listToDict(flow.list, "", "key", "name")
        super.componentDidMount()
    }

    componentWillUnmount() {
        const { audio } = this.state
        audio.load()
    }

    renderInfoModal(customProps = {}) {
        const { form } = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const { resource, title, addArgs } = this.meta
        const { visibleModal, infoData, action } = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleModal.bind(this),
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleAdd.bind(this),
        }

        return (
            visibleModal && (
                <InfoModal
                    renderForm={renderForm}
                    title={title}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={{
                        name: {
                            title: "批次名称",
                            required: true,
                        },
                    }}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }

    renderOperateColumnExtend(record) {
        return (
            <>
                {record.conversation_id && (
                    <a
                        onClick={() => {
                            this.setState({ showInfo: true, record })
                        }}
                    >
                        详情
                    </a>
                )}
            </>
        )
    }

    /**
     * create the multi opertaion buttons
     */

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
                            phone_audio_url={record.phone_audio_url}
                            conversation_id={record.conversation_id}
                            flow_key={record.flow_key}
                            domain_key={record.domain_key}
                            roomHeight="60vh"
                            showIntentFlow={true}
                        />
                    </Modal>
                )}
            </>
        )
    }
}

export default List
