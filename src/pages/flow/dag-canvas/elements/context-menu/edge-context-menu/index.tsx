import React, { useCallback, useRef } from "react"
import { DeleteOutlined } from "@ant-design/icons"
import { useClickAway } from "ahooks"
import { Menu } from "antd"
import { useExperimentGraph } from "@/pages/flow/rx-models/experiment-graph"
import { graphPointToOffsetPoint } from "@/pages/flow/common//utils/graph"
import styles from "./index.less"

interface Props {
    experimentId: string
    data: any
}

export const EdgeContextMenu: React.FC<Props> = (props) => {
    const { experimentId, data } = props
    const containerRef = useRef<HTMLDivElement>(null as any)
    const expGraph = useExperimentGraph(experimentId)

    useClickAway(() => {
        expGraph.clearContextMenuInfo()
    }, containerRef)

    const onDeleteEdge = useCallback(() => {
        expGraph.deleteEdgeFromContextMenu(data.edge)
    }, [expGraph, data])

    const { x: left, y: top } = graphPointToOffsetPoint(
        expGraph.graph!,
        data,
        expGraph.wrapper!
    )

    return (
        <div
            ref={containerRef}
            className={styles.edgeContextMenu}
            style={{ top, left }}
        >
            <Menu>
                <Menu.Item
                    onClick={onDeleteEdge}
                    icon={<DeleteOutlined />}
                    style={{
                        height: "32px",
                        margin: "0",
                        lineHeight: "32px",
                        fontSize: "14px",
                    }}
                >
                    删除
                </Menu.Item>
            </Menu>
        </div>
    )
}
