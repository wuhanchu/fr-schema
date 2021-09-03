import {connect} from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import {Form} from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import {Divider, Card, Modal, Button, message} from "antd"
import frSchema from "@/outter/fr-schema/src"
import {exportData} from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import {schemaFieldType} from "@/outter/fr-schema/src/schema"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"
import ChartModal from "@/pages/kingFlow/KingFlow"

const {decorateList} = frSchema

@connect(({global}) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        const importTemplateUrl = (BASE_PATH + "/import/意图.xlsx").replace(
            "//",
            "/"
        )
        super(props, {
            schema: schemas.intent.schema,
            service: schemas.intent.service,
            importTemplateUrl,
            queryArgs: {pageSize: 10000},
            mini: true,
        })
        this.schema.domain_key.dict = this.props.dict.domain;
        this.state = {
            ...this.state,
            searchValues: {logical_path: "."}
        }
    }

    /**
     * 操作栏按钮
     */
    renderOperationButtons() {
        if (this.props.renderOperationButtons) {
            return this.props.renderOperationButtons()
        }

        return (
            <>
                {!this.props.readOnly && !this.meta.addHide && (
                    <Button
                        type="primary"
                        onClick={() =>
                            this.handleVisibleModal(true, null, "add")
                        }
                    >
                        新增
                    </Button>
                )}
                <Button
                    onClick={() => {
                        this.setState({visibleImport: true})
                    }}
                >
                    导入
                </Button>

                <Button
                    loading={this.state.exportLoading}
                    onClick={() => {
                        this.setState({visibleExport: true})
                    }}
                >
                    导出
                </Button>
            </>
        )
    }

    handleVisibleExportModal = (flag, record, action) => {
        this.setState({
            visibleExport: !!flag,
            infoData: record,
            action,
        })
    }

    handleVisibleImportModal = (flag, record, action) => {
        this.setState({
            visibleImport: !!flag,
            infoData: record,
            action,
        })
    }

    async handleUploadExcel(data, schema) {
        // 更新
        let response
        try {
            response = await this.service.uploadExcel(
                {...data, file: data.file.file},
                schema
            )
        } catch (error) {
            message.error(error.message)
            this.handleVisibleImportModal()
            return
        }

        this.refreshList()
        message.success("添加成功")
        this.handleVisibleImportModal()
        this.handleChangeCallback && this.handleChangeCallback()
        this.props.handleChangeCallback && this.props.handleChangeCallback()

        return response
    }

    async handleExport(args, schema) {
        this.setState({exportLoading: true}, async () => {
            let column = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "external_id"
            })
            let columns = [
                {
                    title: "编号",
                    dataIndex: "id",
                    key: "id",
                },
                column[0],
                {
                    title: "名称",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "编码",
                    dataIndex: "key",
                    key: "key",
                },
                {
                    title: "例子",
                    dataIndex: "example",
                    key: "example",
                },
                {
                    title: "正则表达式",
                    dataIndex: "regex",
                    key: "regex",
                },
                {
                    title: "标准话术",
                    dataIndex: "standard_discourse",
                    key: "standard_discourse",
                },
            ]
            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
            })
            data = decorateList(data.list, this.schema)
            await exportData("意图", data, columns)
            this.setState({exportLoading: false})
        })
        this.handleVisibleExportModal()
    }

    renderExportModal() {
        if (this.props.renderInfoModal) {
            return this.props.renderInfoModal()
        }
        const {form} = this.props
        const renderForm = this.props.renderForm || this.renderForm
        const {resource, title, addArgs} = this.meta
        const {visibleExport, infoData, action} = this.state
        const updateMethods = {
            handleVisibleModal: this.handleVisibleExportModal.bind(this),
            handleUpdate: this.handleUpdate.bind(this),
            handleAdd: this.handleExport.bind(this),
        }

        const schema = {
            domain_key: {
                title: "域",
                required: true,
                extra: "意图对应的域",
                type: schemaFieldType.Select,
                dict: this.props.dict.domain,
            },
        }

        return (
            visibleExport && (
                <InfoModal
                    renderForm={renderForm}
                    title={"导出"}
                    action={action}
                    resource={resource}
                    {...updateMethods}
                    visible={visibleExport}
                    values={infoData}
                    addArgs={addArgs}
                    meta={this.meta}
                    service={this.service}
                    schema={schema}
                    width={600}
                />
            )
        )
    }

    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={{
                    id: {
                        title: "编号",
                    },
                    domain_key: {
                        title: "域",
                        required: true,
                        rules: (rule, value) => value,
                        type: schemaFieldType.Select,
                        dict: this.props.dict.domain,
                    },
                    name: {
                        title: "名称",
                        rules: (rule, value) => value,
                        required: true,
                    },
                    key: {
                        title: "编码",
                        rules: (rule, value) => value,
                        required: true,
                    },
                    example: {
                        title: "例子",
                    },
                    regex: {
                        title: "正则表达式",
                    },
                    standard_discourse: {
                        title: "标准话术",
                    },
                }}
                errorKey={"question_standard"}
                title={"导入"}
                sliceNum={1}
                onCancel={() => this.setState({visibleImport: false})}
                onChange={(data) => this.setState({importData: data})}
                onOk={async () => {
                    // to convert
                    const data = this.state.importData.map((item) => {
                        const {
                            regex,
                            example,
                            standard_discourse,
                            ...others
                        } = item

                        let regex_data = regex && regex.split("\n")
                        let example_data = example && example.split("\n")
                        let standard_discourse_data =
                            standard_discourse && standard_discourse.split("\n")
                        return {
                            ...this.meta.addArgs,
                            ...others,
                            regex: regex_data ? regex_data : [],
                            example: example_data ? example_data : [],
                            standard_discourse: standard_discourse_data
                                ? standard_discourse_data
                                : [],
                            id: parseInt(others.id)
                                ? parseInt(others.id)
                                : undefined,
                        }
                    })
                    // let postData = data.filters

                    await this.service.upInsert(data)
                    this.setState({visibleImport: false})
                    this.refreshList()
                }}
            />
        )
    }

    renderExtend() {
        const {visibleFlow, record} = this.state
        return (
            <>
                <Modal
                    title={"流程配置"}
                    visible={visibleFlow}
                    width={"90%"}
                    style={{top: 20, bottom: 20}}
                    footer={null}
                    destroyOnClose={true}
                    onOk={() => {
                        this.setState({visibleFlow: false})
                    }}
                    onCancel={() => {
                        this.setState({visibleFlow: false})
                    }}
                    closable={false}
                >
                    <ChartModal
                        visibleRelease={false}
                        record={record}
                        schemas={schemas.flow}
                    />
                </Modal>
                {this.renderExportModal()}
            </>
        )
    }

    // 搜索
    renderSearchBar() {
        const {name, domain_key} = this.schema
        const filters = this.createFilters(
            {
                domain_key,
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }

    renderList(inProps = {}) {
        inProps = {expandable: {onExpand: (expanded, record) => this.onExpand(expanded, record)}}
        return super.renderList(inProps)
    }

    // 展开
    async onExpand(expanded, record) {
        // 如果已经获取过,不在重复调用接口
        if (record.children.length) {
            return;
        }
        // 加载
        this.setState({listLoading: true});
        // 获取子意图
        let res = await super.requestList({
            logical_path: 'like.' + record.logical_path + '.*',
            // domain_key: record.domain_key,
            pageSize: 10000,  // 显示所有意图,不分页
        })
        if (res.list.length) {
            // 子意图排序 层级最深在最上面
            let list = decorateList(res.list, this.schema)
            list = list.sort(this.sortUp);
            let result = []
            let arr = []
            for (let i = 0; i < list.length; i++) {
                // 获取当前意图的所有上层意图
                arr = list.filter((value) => {
                    return value.logical_path !== list[i].logical_path && list[i].logical_path.includes(value.logical_path)
                })
                // 存在上层意图则标明当前遍历意图为其他意图的子意图
                if (arr.length) {
                    // 获取当前遍历意图的父意图 并加入其父意图的子集中
                    arr = arr.sort(this.sortUp)
                    let index = list.findIndex((value) => {
                        return value.id === arr[0].id
                    })
                    list[index].children.push(list[i])
                } else {
                    // 不存在上层意图表示当前遍历意图为最高子意图
                    result.push(list[i])
                }
            }
            record.children = [...result]
        } else {
            // 没有子意图时提示,并取消 + 按钮
            record.children = null;
            message.info('当前意图没有子意图')
        }
        this.setState({listLoading: false})
    }


    // 排序规则(从大到小)
    sortUp(a, b) {
        return b.tier - a.tier
    }
}

export default List
