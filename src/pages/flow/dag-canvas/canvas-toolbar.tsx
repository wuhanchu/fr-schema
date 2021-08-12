import React, { useCallback, useState } from "react"
import { Toolbar } from "@antv/x6-react-components"
import { Button, Tooltip } from "antd"
import {
    GatewayOutlined,
    GroupOutlined,
    PlaySquareOutlined,
    RollbackOutlined,
    ToTopOutlined,
    UngroupOutlined,
    AppstoreAddOutlined,
} from "@ant-design/icons"
import { useObservableState } from "@/common/hooks/useObservableState"
import { RxInput } from "@/components/rx-component/rx-input"
import { showModal } from "@/components/modal"
import { addNodeGroup } from "@/mock/graph"
import { BehaviorSubject } from "rxjs"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import { formatNodeInfoToNodeMeta } from "@/pages/flow/rx-models/graph-util"
import styles from "./canvas-toolbar.less"
import { queryGraph, addNode, copyNode } from "@/mock/graph"

interface Props {
    experimentId: string
}

enum Operations {
    UNDO_DELETE = "UNDO_DELETE",
    GROUP_SELECT = "GROUP_SELECT",
    RUN_SELECTED = "RUN_SELECTED",
    NEW_GROUP = "NEW_GROUP",
    UNGROUP = "UNGROUP",
}

export const CanvasToolbar: React.FC<Props> = (props) => {
    const { experimentId } = props
    const [selectionEnabled, setSelectionEnabled] = useState<boolean>(false)
    const expGraph = useExperimentGraph(experimentId)
    const [activeNodeInstance] = useObservableState(
        () => expGraph.activeNodeInstance$
    )
    const [selectedNodes] = useObservableState(() => expGraph.selectedNodes$)
    const [selectedGroup] = useObservableState(() => expGraph.selectedGroup$)

    const onClickItem = useCallback(
        (itemName: string) => {
            switch (itemName) {
                case Operations.UNDO_DELETE:
                    expGraph.undoDeleteNode()
                    break
                case Operations.GROUP_SELECT:
                    expGraph.toggleSelectionEnabled()
                    setSelectionEnabled((enabled) => !enabled)
                    break
                default:
            }
        },
        [
            expGraph,
            activeNodeInstance,
            selectedNodes,
            experimentId,
            selectedGroup,
        ]
    )

    return (
        <div className={styles.canvasToolbar}>
            {/* <Toolbar hoverEffect={true} onClick={onClickItem}>
                <Group>
                    <Item
                        name={Operations.UNDO_DELETE}
                        tooltip="撤销"
                        icon={<RollbackOutlined />}
                    />
                </Group>
            </Toolbar> */}
            <Tooltip title="新增节点">
                <Button
                    style={{ marginLeft: "5px" }}
                    onClick={() => {
                        const expGraph = useExperimentGraph(experimentId)
                        console.log(expGraph)

                        const res = addNode({ name: "新增", x: -100, y: -100 })
                        const newNode = formatNodeInfoToNodeMeta(res as any)
                        expGraph.addNode(newNode)
                        expGraph.clearContextMenuInfo()
                    }}
                >
                    <AppstoreAddOutlined />
                </Button>
            </Tooltip>
            <Tooltip title="新增意图">
                <Button style={{ marginLeft: "5px" }}>
                    <ToTopOutlined />
                </Button>
            </Tooltip>
            <Tooltip title="撤销">
                <Button
                    style={{ marginLeft: "5px" }}
                    onClick={() => expGraph.undoDeleteNode()}
                >
                    <RollbackOutlined />
                </Button>
            </Tooltip>
        </div>
    )
}
