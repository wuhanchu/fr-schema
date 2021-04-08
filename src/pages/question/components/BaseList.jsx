import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import schemas from "@/schemas"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import { Divider, Col, Modal, Button, Upload, message, Row, Spin, Empty } from 'antd'
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import React from "react"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import * as _ from "lodash"
import clone from "clone"
import styles from './style.less'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';


const Minio = require('minio');
const stream = require('stream');
// 你的minio配置信息
var minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 80,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'dataknown1234',
});
console.log(minioClient)

// base64转blob
export function toBlob(base64Data) {
    let byteString = base64Data
    if (base64Data.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(base64Data.split(',')[1]); // base64 解码
    } else {
        byteString = unescape(base64Data.split(',')[1]);
    }
    // 获取文件类型
    const mimeString = base64Data.split(';')[0].split(":")[1]; // mime类型
    // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区
    // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组
    // let uintArr = new Uint8Array(arrayBuffer) // 创建视图
    const uintArr = new Uint8Array(byteString.length); // 创建视图
    for (let i = 0; i < byteString.length; i += 1) {
        uintArr[i] = byteString.charCodeAt(i);

    }
    // 生成blob
    const blob = new Blob([uintArr], {
        type: mimeString
    })
    // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上
    return blob;
};

/**
* 上传文件
* @param {*} bucketName 桶名
* @param {*} file info为antd上传组件的file
* @param {*} callback 回调函数，返回下载url
*/

export function uploadFile(bucketName, file, callback) {
    // 获取文件类型及大小
    const fileName = file.name
    const mineType = file.type
    const fileSize = file.size
    // 参数
    const metadata = {
        "content-type": mineType,
        "content-length": fileSize
    }

    // 将文件转换为minio可接收的格式
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = e => {
        const dataurl = e.target.result
        // base64转blob
        const blob = toBlob(dataurl);
        // blob转arrayBuffer
        const reader2 = new FileReader();
        reader2.readAsArrayBuffer(blob);
        reader2.onload = ex => {
            // 定义流
            const bufferStream = new stream.PassThrough();
            // 将buffer写入
            bufferStream.end(Buffer.from(ex.target.result));
            // 上传
            minioClient.putObject(bucketName, fileName, bufferStream, fileSize, metadata, err => {
                if (err == null) {
                    // 获取可下载的url
                    minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60, (err1, presignedUrl) => {
                        if (err1) return;
                        // 将数据返回
                        callback({ url: presignedUrl, bucketName, fileName: file.name });
                    });
                }
            })
        }
    }
};

// 先判断桶是否存在, 如果可确保桶已经存在，则直接调用upload方法

export function checkedAndUpload(bucketName, info, callback) {
    minioClient.bucketExists(bucketName, err => {
        if (err) {
            minioClient.makeBucket(bucketName, 'us-east-1', err1 => {
                if (err1) {
                    console.error(`文件上传失败`);
                    return
                }
                uploadFile(bucketName, info, callback);
            });
        } else {
            uploadFile(bucketName, info, callback);
        }

    });

}

@Form.create()
class BaseList extends DataList {
    constructor(props) {
        const importTemplateUrl = (
            BASE_PATH + "/import/掌数_知料_知识库信息导入.xlsx"
        ).replace("//", "/")
        super(props, {
            operateWidth: 150,
            schema: clone(schemas.question.schema),
            service: schemas.question.service,
            allowExport: true,
            showSelect: true,
            allowImport: true,
            infoProps: {
                offline: true,
                colNum: 2,
                width: '1000px',
            },
            importTemplateUrl,
        })
    }

    async componentDidMount() {
        const response = await this.service.get({
            ...this.meta.queryArgs,
            select: "label",
            limit: 9999,
        })

        let labelDictList = {}
        console.log(response)
        response.list.forEach((item) => {
            if (!_.isNil(item.label)) {
                item.label.forEach((value) => {
                    console.log(value)
                    labelDictList[value] = {
                        value: value,
                        remark: value,
                    }
                })
            }
        })
        this.setState({
            attachment: [],
            loadingAnnex: false
        })
        console.log(labelDictList)
        this.schema.label.dict = labelDictList
        await super.componentDidMount()
    }

    // 搜索
    renderSearchBar() {
        const { group, label, question_standard } = this.schema
        const filters = this.createFilters(
            {
                group,
                label: {
                    ...label,
                },
                question_standard: {
                    ...question_standard,
                    type: schemaFieldType.Input,
                },
            },
            5
        )
        return this.createSearchBar(filters)
    }
    renderOperateColumnExtend(record) {
        return <><Divider type="vertical"></Divider><a onClick={() => { this.setState({ showAnnex: true, record: record, attachment: clone(record.attachment) }) }}>附件</a> </>
    }
    /**
     * 渲染信息弹出框
     * @param customProps 定制的属性
     * @returns {*}
     */
    renderInfoModal(customProps = {}) {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
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
                    width={"820px"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleModal}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={this.schema}
                    {...this.meta.infoProps}
                    {...customProps}
                />
            )
        )
    }

    renderExtend() {
        const props = {
            name: 'file',
            // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: 'authorization-text',
            },
            maxCount: 1,
            itemRender: () => { <></> },
            beforeUpload: (file, props, data) => {
                this.setState({
                    loadingAnnex: true
                })
                checkedAndUpload('zknowninfo', file, res => {
                    // 输出url
                    message.success(`文件上传成功`);
                    // this.state.attachment.push(res)
                    let attachment = []
                    if (this.state.attachment)
                        attachment = clone(this.state.attachment)
                    attachment.push(res)
                    this.setState({
                        attachment,
                        loadingAnnex: false
                    })
                });
            },
        };
        console.log(this.state.record)

        const footer = <>
            <Row style={{ height: '32px', overflow: 'hidden' }} gutter={24}>
                <Col xl={16}>
                    <Upload {...props}>
                        <Button icon={<UploadOutlined />}>上传附件</Button>
                    </Upload>
                </Col>
                <Col xl={8}>
                    <Button onClick={() => { this.setState({ showAnnex: false }) }}>
                        取消
                    </Button>
                    <Button type="primary" onClick={async () => {
                        await this.service.patch({id:this.state.record.id, attachment: this.state.attachment })
                        message.success('修改成功！')
                        this.setState({
                            showAnnex: false
                        })
                        this.refreshList()
                    }}>
                        确定
                    </Button>
                </Col>
            </Row>
        </>
        return <>{this.state.showAnnex&& <Modal
            visible={this.state.showAnnex}
            title={'附件管理'}
            onCancel={() => { this.setState({ showAnnex: false }) }}
            footer={footer}
        >
            <Spin spinning={this.state.loadingAnnex} tip="文件上传中..."><div className={styles.salesRank}>
                <ul className={styles.rankingList}>
                    {this.state.attachment && this.state.attachment.map((item, index) => {
                        let itemObj = item
                        if (typeof (item) === 'string')
                            itemObj = JSON.parse(item)
                        return (
                            <li key={itemObj.fileName}>
                                <span className={`${styles.rankingItemNumber} ${index < 3 ? styles.active : ''}`}>
                                    {index + 1}
                                </span>
                                <span className={styles.rankingItemTitle} title={itemObj.fileName}>
                                    {itemObj.fileName}
                                </span>
                                <a onClick={() => {
                                    let attachment = this.state.attachment
                                    attachment.splice(index, 1)
                                    this.setState({
                                        attachment: clone(attachment)
                                    })
                                }}><DeleteOutlined /></a>
                            </li>
                        )
                    })}
                    {
                        (!this.state.attachment || !this.state.attachment.length) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }
                </ul>
            </div></Spin>
        </Modal>}</>
    }


    handleSearch = (fieldsValue) => {
        console.log(fieldsValue["label"])
        if (fieldsValue["label"].length) {
            fieldsValue.label = "ov.{" + fieldsValue["label"] + "}"
        } else {
            fieldsValue.label = undefined
        }
        this.onSearch(fieldsValue)
        // e.preventDefault()
    }
    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={schemas.question.schema}
                errorKey={"question_standard"}
                sliceNum={4}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    const data = this.state.importData.map((item) => {
                        const { label, question_extend, ...others } = item
                        let question_extend_data = question_extend
                        if (question_extend instanceof String) {
                            question_extend_data = [question_extend]
                        }

                        return {
                            ...this.meta.addArgs,
                            label: label && label.split("|"),
                            question_extend: question_extend_data,
                            ...others,
                        }
                    })
                    await this.service.upInsert(data)
                    this.setState({ visibleImport: false })
                    this.refreshList()
                }}
            />
        )
    }
}

export default BaseList
