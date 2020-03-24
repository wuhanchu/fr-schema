import React from "react"
import { Modal } from "antd"
import Dialogue from "@/pages/question/components/Dialogue"

export default function DialogueModal(props) {
    return (
        <Modal
            visible={props.visibleDialogue}
            onCancel={() => {
                props.handleHideDialogue()
            }}
            style={{ height: "700px" }}
            title={"对话"}
            width={900}
            footer={null}
            {...props}
        >
            <Dialogue {...props} />
        </Modal>
    )
}
