import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Modal, Button, message } from "antd"
import frSchema from "@/outter/fr-schema/src"
import { exportData } from "@/outter/fr-schema-antd-utils/src/utils/xlsx"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"
import InfoModal from "@/outter/fr-schema-antd-utils/src/components/Page/InfoModal"
import ImportModal from "@/outter/fr-schema-antd-utils/src/components/modal/ImportModal"

const { decorateList } = frSchema

@connect(({ global }) => ({
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
            queryArgs: { pageSize: 10000, limit: 10000 },
            mini: true,
            showDelete: true,
            showSelect: true,
            operateWidth: "120px",
        })
        this.schema.domain_key.dict = this.props.dict.domain
        this.state = {
            ...this.state,
            // tableType: 'old',
            searchValues: { logical_path: "." },
            expandedRowKeys: [],
        }
    }

    async componentDidMount() {
        super.componentDidMount()
        this.schema.regex.props.onChange = (data) => {
            this.setState({ regex: data })
        }
        this.schema.regex.props.onInputKeyDown = (e, data) => {
            //回车键
            const { regex } = this.state
            if (e.keyCode === 13) {
                if (regex) {
                    const isRepeat = regex.indexOf(e.target.value)
                    if (isRepeat > -1) {
                        e.preventDefault()
                        e.stopPropagation()
                    }
                }
            }
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
                        this.setState({ visibleImport: true })
                    }}
                >
                    导入
                </Button>

                <Button
                    loading={this.state.exportLoading}
                    onClick={() => {
                        this.handleExport()
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

    handleVisibleModal = (flag, record, action) => {
        this.setState({
            visibleModal: !!flag,
            infoData: record,
            action,
            regex: record && record.regex,
        })
    }

    async handleUploadExcel(data, schema) {
        // 更新
        let response
        try {
            response = await this.service.uploadExcel(
                { ...data, file: data.file.file },
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
        this.setState({ exportLoading: true }, async () => {
            let column = this.getColumns(false).filter((item) => {
                return !item.isExpand && item.key !== "external_id"
            })
            console.log(column)
            let columns = [
                column[2],
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
                column[3],
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
                {
                    title: "例子",
                    dataIndex: "example",
                    key: "example",
                },
            ]
            let data = await this.requestList({
                pageSize: 1000000,
                offset: 0,
                ...args,
                logical_path: undefined,
            })
            data = decorateList(data.list, this.schema)
            await exportData("意图", data, columns)
            this.setState({ exportLoading: false })
        })
        this.handleVisibleExportModal()
    }

    async refreshList(param) {
        if (param) {
            this.setState({ searchValues: param })
        }
        console.log("搜索问题")
        this.setState({ listLoading: true }, async () => {
            let logical_path = "not.like.*.*"
            if (this.state.searchValues.name || this.state.searchValues.key) {
                logical_path = undefined
            }
            let data = await this.requestList({ logical_path })
            let list = decorateList(data.list, this.schema)
            this.convertList && (list = this.convertList(list))
            console.log(list)
            this.setState({
                selectedRows: [],
                data: {
                    ...data,
                    list,
                },
            })
            await this.initTree()
        })
    }
    renderImportModal() {
        return (
            <ImportModal
                importTemplateUrl={this.meta.importTemplateUrl}
                schema={{
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
                    logical_path: {
                        title: "意图路径",
                        require: true,
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
                confirmLoading={this.state.confirmLoading}
                title={"导入"}
                sliceNum={1}
                onCancel={() => this.setState({ visibleImport: false })}
                onChange={(data) => this.setState({ importData: data })}
                onOk={async () => {
                    // to convert
                    this.setState({ confirmLoading: true })
                    const data = this.state.importData.map((item) => {
                        const {
                            regex,
                            example,
                            standard_discourse,
                            ...others
                        } = item

                        let regex_data =
                            regex && regex.replace(/\r/g, "").split("\n")
                        let example_data =
                            example && example.replace(/\r/g, "").split("\n")
                        let standard_discourse_data =
                            standard_discourse &&
                            standard_discourse.replace(/\r/g, "").split("\n")
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
                    try {
                        await this.service.upInsert(data)
                        this.refreshList()
                        this.setState({
                            visibleImport: false,
                            confirmLoading: false,
                        })
                    } catch (error) {
                        message.error(error.message)
                        this.setState({
                            confirmLoading: false,
                        })
                    }
                }}
            />
        )
    }

    // 搜索
    renderSearchBar() {
        const { name, domain_key } = this.schema
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
        let { expandedRowKeys } = this.state
        inProps = {
            expandable: {
                onExpand: (expanded, record) => this.onExpand(expanded, record),
                expandedRowKeys,

                // defaultExpandAllRows: true
                // defaultExpandedRowKeys: true
            },
        }
        return super.renderList(inProps)
    }

    async initTree() {
        // 加载
        this.setState({ listLoading: true })
        // 获取子意图
        let res = await super.requestList({
            // logical_path: "like." + record.logical_path + ".*",
            // domain_key: record.domain_key,
            pageSize: 10000, // 显示所有意图,不分页
            name: undefined,
            logical_path: undefined,
        })
        this.setState({ listLoading: true })
        let list = this.state.data.list.map((record) => {
            let list = res.list.filter((itemList) => {
                if (!itemList.logical_path) {
                    console.log("itemList", itemList)
                }
                return (
                    itemList.logical_path &&
                    itemList.logical_path.indexOf(record.logical_path + ".") ===
                        0 &&
                    itemList.logical_path !== record.logical_path &&
                    itemList.domain_key === record.domain_key
                )
            })
            list = decorateList(list, this.schema)
            list = list.sort(this.sortUp)

            let result = []
            let arr = []
            for (let i = 0; i < list.length; i++) {
                // 获取当前意图的所有上层意图
                arr = list.filter((value) => {
                    return (
                        value.logical_path !== list[i].logical_path &&
                        list[i].logical_path.includes(
                            value.logical_path + "."
                        ) &&
                        list[i].domain_key === value.domain_key
                    )
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
            return record
            // }
        })
        const { data } = this.state
        let { expandedRowKeys } = this.state
        this.setState({ expandedRowKeys: [...expandedRowKeys] })
        this.setState({ listLoading: false, data: { ...data, list } })
    }

    // 展开
    async onExpand(expanded, record) {
        console.log("expanded, record", expanded, record)
        let { expandedRowKeys } = this.state
        let flag = expandedRowKeys.includes(record.id) // 是否已经展开过
        // 展开
        if (expanded) {
            // 新数据添加
            if (!flag) {
                expandedRowKeys.push(record.id)
            }
        } else {
            // 收起则把数据去除
            if (flag) {
                expandedRowKeys = expandedRowKeys.filter((value) => {
                    return value !== record.id
                })
            }
        }
        this.setState({ expandedRowKeys: [...expandedRowKeys] })
        // 如果已经获取过,不在重复调用接口
        if (record.children.length) {
            return
        }
        // 加载
        this.setState({ listLoading: true })
        // 获取子意图
        this.setState({ listLoading: false })
    }

    // 排序规则(从大到小)
    sortUp(a, b) {
        return b.tier - a.tier
    }

    /**
     * 个性化转换对应的list数据
     * @param list
     * @returns {*}
     */
    convertList(list) {
        return list
    }

    // 搜索
    onSearch(fieldsValue) {
        //  更新列表
        console.log("更新列表")
        const searchValues = { ...this.state.searchValues }

        Object.keys(fieldsValue).forEach((key) => {
            if (!fieldsValue[key]) {
                delete searchValues[key]
                return
            }

            searchValues[key] = fieldsValue[key]
        })

        this.setState(
            {
                pagination: { ...this.state.pagination, currentPage: 1 },
                searchValues: {
                    ...searchValues,
                    logical_path: searchValues.name ? null : ".",
                },
                // expandedRowKeys: [],
            },
            async () => {
                this.refreshList()
            }
        )
    }

    /**
     * 重置查询
     */
    handleFormReset = () => {
        const { order } = this.props

        this.formRef.current.resetFields()
        this.setState(
            {
                pagination: { ...this.state.pagination, currentPage: 1 },
                searchValues: { order, logical_path: "." },
                // expandedRowKeys: [],
            },
            () => {
                this.refreshList()
            }
        )
    }
}

export default List
