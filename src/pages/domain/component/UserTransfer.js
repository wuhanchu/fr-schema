import React, { useState } from "react"
import { Transfer, Tree, Modal } from "antd"

// Customize Table Transfer
const isChecked = (selectedKeys, eventKey) =>
    selectedKeys.indexOf(eventKey) !== -1

const generateTree = (treeNodes = [], checkedKeys = []) =>
    treeNodes.map(({ children, ...props }) => ({
        ...props,
        disabled: checkedKeys.includes(props.key),
        children: generateTree(children, checkedKeys),
    }))

const TreeTransfer = ({ dataSource, targetKeys, ...restProps }) => {
    const transferDataSource = []
    function flatten(list = []) {
        list.forEach((item) => {
            transferDataSource.push(item)
            flatten(item.children)
        })
    }
    flatten(dataSource)
    const [selectedKeys, setSelectedKeys] = useState([])
    const onCheck = (checkedKeysValue, info, onItemSelectAll, checkedKeys) => {
        onItemSelectAll(checkedKeysValue, true)
    }

    const onSelect = (selectedKeysValue, info) => {
        console.log("onSelect", info)
    }
    return (
        <Transfer
            {...restProps}
            showSearch
            targetKeys={targetKeys}
            dataSource={transferDataSource}
            className="tree-transfer"
            render={(item) => item.title}
            showSelectAll={false}
        >
            {({ direction, onItemSelect, selectedKeys, onItemSelectAll }) => {
                if (direction === "left") {
                    const checkedKeys = [...selectedKeys, ...targetKeys]
                    return (
                        <Tree
                            blockNode
                            defaultExpandAll
                            checkable
                            // checkedKeys={checkedKeys}
                            onSelect={onSelect}
                            onCheck={(checkedKeysValue, info) => {
                                onCheck(
                                    checkedKeysValue,
                                    info,
                                    onItemSelectAll,
                                    checkedKeys
                                )
                            }}
                            // treeData={treeData}
                            treeData={generateTree(dataSource, targetKeys)}
                            defaultCheckedKeys={[
                                "0-0",
                                "0-1-0",
                                "0-1-1-0",
                                "0-1-1-1",
                            ]}
                        />
                    )
                }
            }}
        </Transfer>
    )
}

const treeData = [
    { key: "0-0", title: "0-0" },
    {
        key: "0-1",
        title: "0-1",
        children: [
            { key: "0-1-0", title: "0-1-0" },
            {
                key: "0-1-1",
                title: "0-1-1",
                children: [
                    { key: "0-1-1-0", title: "0-1-1-0" },
                    { key: "0-1-1-1", title: "0-1-1-1" },
                ],
            },
        ],
    },
    { key: "0-2", title: "0-3" },
]

const MYTransfer = () => {
    const [targetKeys, setTargetKeys] = useState([])
    const onChange = (keys) => {
        setTargetKeys(keys)
    }
    return (
        <TreeTransfer
            listStyle={{
                width: 350,
                height: 300,
            }}
            dataSource={treeData}
            targetKeys={targetKeys}
            onChange={onChange}
        />
    )
}

class UserTransfer extends React.Component {
    render() {
        return (
            <Modal
                width={900}
                visible={true}
                onCancel={this.props.onCancel}
                title={"人员分配"}
            >
                <MYTransfer />
            </Modal>
        )
    }
}

export default UserTransfer
