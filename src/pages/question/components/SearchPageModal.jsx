import React from "react"
import { Modal } from "antd"
import SearchPage from "@/pages/question/components/SearchPage"

export default function SearchPageModal(props) {
    return (
        <Modal
            visible={true}
            title={"知识搜索"}
            width={1000}
            footer={null}
            closable={true}
            {...props}
        >
            <SearchPage {...props} />
        </Modal>
    )
}
