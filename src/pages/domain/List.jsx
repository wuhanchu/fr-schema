import { connect } from "dva"
import ListPage from "@/outter/fr-schema-antd-utils/src/components/Page/ListPage"
import schemas from "@/schemas"
import React, { Fragment } from "react"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import SearchPageModal from "@/pages/question/components/SearchPageModal"
import { Divider } from "antd"
import DialogueModal from "@/pages/question/components/DialogueModal"

@connect(({ global }) => ({
    dict: global.dict,
}))
@Form.create()
class List extends ListPage {
    constructor(props) {
        super(props, {
            schema: schemas.domain.schema,
            service: schemas.domain.service,
            infoProps: {
                offline: true,
                width: "1100px",
                isCustomize: true,
                customize: {
                    left: 12,
                    right: 12,
                },
            },
        })
    }

    renderExtend() {
        const { record, visibleSearch, visibleDialogue } = this.state
        return (
            <Fragment>
                {visibleSearch && (
                    <SearchPageModal
                        type={"domain_id"}
                        onCancel={() => {
                            this.setState({ visibleSearch: false })
                        }}
                        title={record.name + "知识搜索"}
                        record={record}
                    />
                )}
                {visibleDialogue && (
                    <DialogueModal
                        type={"domain_id"}
                        record={record}
                        visibleDialogue={visibleDialogue}
                        handleHideDialogue={() =>
                            this.setState({ visibleDialogue: false })
                        }
                    />
                )}
            </Fragment>
        )
    }

    renderOperateColumnExtend(record) {
        return (
            <Fragment>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleSearch: true })
                    }}
                >
                    搜索
                </a>
                <Divider type="vertical" />
                <a
                    onClick={() => {
                        this.setState({ record, visibleDialogue: true })
                    }}
                >
                    对话
                </a>
            </Fragment>
        )
    }
    renderSearchBar() {
        const { name } = this.schema
        const filters = this.createFilters(
            {
                name,
            },
            5
        )
        return this.createSearchBar(filters)
    }
}

export default List
