import React, { useContext, useState, useEffect, useRef, Fragment } from "react"
import { Table, Button, Form, Alert } from "antd"
import "./EditTable.css"
import { autobind } from "core-decorators"
import StandardTable from "@/outter/fr-schema-antd-utils/src/components/StandardTable"
import styles from "@/outter/fr-schema-antd-utils/src/components/StandardTable/index.less"

const EditableContext = React.createContext(null)
import { createComponent } from "@/outter/fr-schema-antd-utils/src/utils/component"

// 行
const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm()
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
}

// 单元格
const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    renderInput,
    item,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false)
    const inputRef = useRef(null)
    const form = useContext(EditableContext)

    useEffect(() => {
        if (editing) {
            // 富文本的API特殊处理
            if (item.type !== "BraftEditor") {
                inputRef.current && inputRef.current.focus()
                return
            }

            item.props.style = { ...item.props.style, height: "260px" }
            form.current = form
            inputRef.current && inputRef.current.draftInstance.focus()
        }
    }, [editing])

    const toggleEdit = () => {
        if (item.type !== "BraftEditor") {
            setEditing(!editing)
            record[dataIndex] && form.setFieldsValue({
                [dataIndex]: record[dataIndex]
            })
        }
    }

    const save = async () => {
        try {
            let values
            if (item.type === "BraftEditor") {
                values = await form.getFieldsValue()
            } else {
                values = await form.validateFields()
                if (Array.isArray(values[dataIndex])) {
                    values[dataIndex] = values[dataIndex].filter((values) => {
                        return values.trim() !== ""
                    })
                }
                if (typeof values[dataIndex] === "string") {
                    values[dataIndex] = values[dataIndex].trim()
                }
            }
            toggleEdit()
            if (values[dataIndex] === record[dataIndex]) return
            handleSave({ ...record, ...values })
        } catch (errInfo) {
            console.log("保存失败:", errInfo)
        }
    }

    let childNode = children
    if (editable) {
        dataIndex =
            item.dict ||
            item.type === "DatePicker" ||
            item.type === "Select" ||
            item.unit
                ? item.key
                : dataIndex

        childNode = (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: item.required,
                        message: `${title} is required.`,
                    },
                ]}
            >
                {createComponent(
                    item,
                    { [dataIndex]: record[dataIndex] },
                    { onBlur: save, ref: inputRef, form, editStatus: true },
                    "edit",
                    "100%"
                )}
            </Form.Item>
        )

        childNode = editing ? (
            childNode
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        )
    }

    return <td {...restProps}>{childNode}</td>
}

@autobind
class EditableTable extends StandardTable {
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
        }
    }

    // 数据修改
    handleSave = (row) => {
        this.props.onEditDataChange && this.props.onEditDataChange(row)
    }

    render() {
        const { selectedRowKeys, needTotalList } = this.state
        const {
            selectedRows,
            data: { list, pagination },
            loading,
            columns,
            rowKey,
            bordered,
            ...otherProps
        } = this.props
        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        }
        const columnsRes = columns.map((col) => {
            if (!col.editable) {
                return col
            }
            return {
                ...col,
                onCell: (record) => ({
                    record,
                    editable: true,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                    renderInput: col.renderInput || null,
                    item: col,
                }),
            }
        })

        const paginationProps = {
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ["10", "20", "50", "100", "200", "300"],
            ...pagination,
        }

        const rowSelection = {
            selectedRowKeys,
            onChange: this.handleRowSelectChange,
            getCheckboxProps: (record) => ({
                disabled: record.disabled,
            }),
        }
        let tableWidth
        if (document.getElementById("table")) {
            tableWidth = document.getElementById("table").offsetWidth
        }
        return (
            <div className={styles.standardTable}>
                {selectedRows && selectedRows.length > 0 && (
                    <div className={styles.tableAlert}>
                        <Alert
                            message={
                                <Fragment>
                                    已选择{" "}
                                    <a style={{ fontWeight: 600 }}>
                                        {selectedRowKeys.length}
                                    </a>{" "}
                                    项&nbsp;&nbsp;
                                    {needTotalList.map((item) => (
                                        <span
                                            style={{ marginLeft: 8 }}
                                            key={item.dataIndex}
                                        >
                                            {item.title}
                                            总计&nbsp;
                                            <span style={{ fontWeight: 600 }}>
                                                {item.render
                                                    ? item.render(item.total)
                                                    : item.total}
                                            </span>
                                        </span>
                                    ))}
                                    <a
                                        onClick={this.cleanSelectedKeys}
                                        style={{ marginLeft: 24 }}
                                    >
                                        清空
                                    </a>
                                </Fragment>
                            }
                            type="info"
                            showIcon
                        />
                    </div>
                )}
                <Table
                    id={"table"}
                    components={components}
                    loading={loading}
                    bordered={bordered}
                    rowKey={rowKey || "key"}
                    rowSelection={rowSelection}
                    dataSource={list}
                    columns={columnsRes}
                    pagination={paginationProps}
                    onChange={this.handleTableChange}
                    size={"middle"}
                    {...otherProps}
                    scroll={{ x: "max-content", y: "50vh" }}
                />
            </div>
        )
    }
}

export default EditableTable
