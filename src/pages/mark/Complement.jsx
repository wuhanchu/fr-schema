import { connect } from "dva"
import DataList from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
import schemas from "@/schemas"
import React from "react"
import { Button, Popconfirm, Divider } from "antd"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import frSchema from "@/outter/fr-schema/src"

const { utils } = frSchema
@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends DataList {
    constructor(props) {
        super(props, {
            showSelect: true,
            schema: schemas.mark.schema,
            addHide: true,
            service: schemas.mark.service,
            infoProps: {
                width: "900px",
            },
            operateWidth: "120px",
        })
    }

    async componentDidMount() {
        super.componentDidMount()
    }

    renderOperationMulit() {
        return (
            <span>
                <>
                    {
                        <Button
                            type="primary"
                            onClick={() =>
                                // this.handleVisibleModal(true, null, actions.add)
                                console.log("补充")
                            }
                        >
                            补充
                        </Button>
                    }
                </>
                {
                    <Popconfirm
                        title="是否要删除选中的数据？"
                        onConfirm={(e) => {
                            const { dispatch } = this.props
                            const { selectedRows } = this.state
                            this.handleDeleteMulti(selectedRows)
                        }}
                    >
                        <Button>丢弃</Button>
                    </Popconfirm>
                }
            </span>
        )
    }

    renderOperationExtend() {
        return (
            <>
                {
                    <Button
                        onClick={() =>
                            // this.handleVisibleModal(true, null, actions.add)
                            console.log("同步数据")
                        }
                    >
                        同步数据
                    </Button>
                }
            </>
        )
    }

    /**
     * 表格操作列
     * @returns {{width: string, fixed: (*|string), title: string, render: (function(*, *=): *)}}
     */
    renderOperateColumn(props = {}) {
        const { scroll } = this.meta
        const { inDel } = this.state
        const { showEdit = true, showDelete = true } = {
            ...this.meta,
            ...props,
        }
        return (
            !this.meta.readOnly &&
            !this.props.readOnly && {
                title: "是否正确返回",
                width: this.meta.operateWidth,
                fixed: "right",
                render: (text, record) => (
                    <>
                        {showEdit && (
                            <>
                                <a onClick={() => console.log("补充")}>补充</a>
                            </>
                        )}
                        {showDelete && (
                            <>
                                {showEdit && <Divider type="vertical" />}
                                <Popconfirm
                                    title="是否要删除此行？"
                                    onConfirm={async (e) => {
                                        this.setState({ record })
                                        // await this.handleDelete(record)
                                        e.stopPropagation()
                                    }}
                                >
                                    <a>
                                        {inDel &&
                                            this.state.record.id &&
                                            this.state.record.id ===
                                                record.id && (
                                                <LoadingOutlined />
                                            )}
                                        丢弃
                                    </a>
                                </Popconfirm>
                            </>
                        )}
                        {this.renderOperateColumnExtend(record)}
                    </>
                ),
            }
        )
    }

    renderSearchBar() {
        const { create_time, status } = this.schema
        const filters = this.createFilters(
            {
                create_time,
                status,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
