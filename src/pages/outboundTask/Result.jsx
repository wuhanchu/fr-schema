import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import styles from "@/outter/fr-schema-antd-utils/src/components/Page/DataList.less"
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
class List extends DataList {
    constructor(props) {
        super(props, {
            schema: schemas.taskResult.schema,
            service: schemas.taskResult.service,
            showDelete: false,
            showEdit: false,
            showSelect: true,
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
        let audio = document.createElement("AUDIO")
        audio.crossOrigin = "anonymous"

        this.setState({
            audio: audio,
        })
        this.schema.phone_audio_url.render = (item, data) => {
            console.log(item)
            if (!data.phone_audio_url) {
                return ""
            }
            return (
                <>
                    {this.state.audioIndex !== data.id ? (
                        <a
                            onClick={() => {
                                const { audio } = this.state
                                try {
                                    audio.crossOrigin = "anonymous"
                                    audio.src = item.phone_audio_url
                                    var playPromise = audio.play()

                                    if (playPromise !== undefined) {
                                        playPromise
                                            .then((_) => {
                                                // Automatic playback started!
                                                // Show playing UI.
                                            })
                                            .catch((error) => {
                                                // Auto-play was prevented
                                                // Show paused UI.
                                            })
                                    }
                                    audio.onended = () => {
                                        this.setState({
                                            audioIndex: undefined,
                                        })
                                    }
                                } catch (error) {}

                                this.setState({ audioIndex: data.id })
                            }}
                            style={{ marginLeft: "5px" }}
                        >
                            <PlaySquareOutlined />
                        </a>
                    ) : (
                        <a
                            onClick={() => {
                                const { audio } = this.state
                                try {
                                    audio.load()
                                } catch (error) {}
                                this.setState({
                                    audioIndex: undefined,
                                })
                            }}
                            style={{ marginLeft: "5px" }}
                        >
                            <SyncOutlined spin />
                        </a>
                    )}
                    <Divider type="vertical" />
                    <a
                        onClick={() => {
                            FileSaver(
                                data.phone_audio_url,
                                data.external_id || "导出"
                            )
                        }}
                    >
                        <DownloadOutlined />
                    </a>
                </>
            )
        }
        let batchArray = await this.service.getBatch({ limit: 1000 })
        console.log(batchArray)
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
                        明细
                    </a>
                )}
            </>
        )
    }

    renderOperationBar() {
        const { showSelect, showDelete = true } = this.meta
        const { selectedRows } = this.state

        return (
            <div className={styles.tableListOperator}>
                <Row
                    type="flex"
                    justify="space-between"
                    className={styles.operationBar}
                >
                    <Col>
                        {this.renderOperationButtons()}
                        {showSelect &&
                            selectedRows.length > 0 &&
                            this.renderOperationMulit()}
                    </Col>
                    <Col>{this.renderOperationExtend()}</Col>
                </Row>
            </div>
        )
    }

    /**
     * create the multi opertaion buttons
     */

    async handleAdd(data, schema) {
        // 更新
        const { selectedRows } = this.state
        let response
        try {
            let args = {}
            args.name = data.name
            args.task_id = this.props.record.external_id
            let number_group = []
            selectedRows.map((item) => {
                number_group.push({
                    phone: item.to_phone,
                    auto_maxtimes:
                        (item.request_info &&
                            item.request_info.auto_maxtimes) ||
                        undefined,
                    slot: item.request_info,
                })
            })

            args.number_group = unique(number_group, "phone")
            response = await schemas.outboundTask.service.importData(
                args,
                schema
            )
            await schemas.outboundTask.service.changeTaskStatus({
                task_id: this.props.record.external_id,
                status: "running",
            })
            this.refreshList()
            message.success("重播成功")
            this.handleVisibleModal()
        } catch (error) {
            message.error(error.message)
        }
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    renderOperationMulit() {
        return (
            <span>
                <Popconfirm
                    title="是否要重拨选中的数据？"
                    onConfirm={(e) => {
                        const { dispatch } = this.props
                        const { selectedRows } = this.state
                        this.handleAdd({}, this.schema)
                    }}
                >
                    <Button>批量重拨</Button>
                </Popconfirm>
            </span>
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
