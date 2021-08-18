import React from 'react';
import {Form, Input, Button, Radio, Slider, Switch} from 'antd';
import './RightDrawer.less';
import {RiseOutlined, DeleteOutlined} from '@ant-design/icons';

let FormItem = Form.Item

class RightDrawer extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            gridTypeList: [
                {
                    label: '四边网格',
                    value: 'mesh'
                },
                {
                    label: '点状网格',
                    value: 'dot'
                }
            ],
            showGrid: true,
            gridType: 'mesh',
        }
    }

    render() {
        return (
            <div className="drawer_container">
                {this.renderGrid()}
                {this.renderNode()}
                {this.renderEdge()}
            </div>
        )
    }

    renderGrid() {
        let {gridTypeList, showGrid, gridType} = this.state;
        let {chooseType} = this.props;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };
        return (
            chooseType === 'grid' && (
                <div>
                    <div className="drawer_title">画布背景设置</div>
                    <div className="drawer_wrap">
                        <Form labelAlign="left" colon={false} {...formItemLayout}>
                            <FormItem label="显示网格">
                                <Switch checked={showGrid} onChange={(checked) => this.onSwitchChange(checked)}/>
                            </FormItem>
                            {showGrid && (
                                <div>
                                    <FormItem label="网格类型">
                                        <Radio.Group value={gridType}
                                                     onChange={e => this.onRadioChange(e)}>
                                            <div style={{display: 'flex'}}>
                                                {gridTypeList.map((item, index) =>
                                                    <Radio key={`radio${index}`} value={item.value}>
                                                        {item.label}
                                                    </Radio>
                                                )}
                                            </div>

                                        </Radio.Group>
                                    </FormItem>
                                    <FormItem label="网格大小">
                                        <Slider min={0} max={10} defaultValue={1} onChange={(value) => this.onGridSizeChange(value)}/>
                                    </FormItem>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            )
        )
    }

    renderNode() {
        let {chooseType} = this.props;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };
        return (
            chooseType === 'node' && (
                <div>
                    <div className="drawer_title">节点设置</div>
                    <div className="drawer_wrap">
                        <Form labelAlign="left" colon={false} {...formItemLayout}>
                            <FormItem label="名称">
                                <Input v-model="drawerNode.nodeText"/>
                            </FormItem>
                            <FormItem label="功能">
                                <Button type="primary" icon={<RiseOutlined/>} className="button"
                                        style={{marginRight: '10px'}} onClick={_ => this.toTopZIndex()}>置顶</Button>
                                <Button type="danger" className="button" icon={<DeleteOutlined/>}
                                        onClick={_ => this.deleteNode()}>删除</Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            )
        )
    }

    renderEdge() {
        let {chooseType} = this.props;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };
        return chooseType === 'edge' && (
            <div>
                <div className="drawer_title">连线设置</div>
                <div className="drawer_wrap">
                    <Form labelAlign="left" colon={false} {...formItemLayout}>
                        <FormItem label="名称">
                            <Input v-model="drawerNode.nodeText"/>
                        </FormItem>
                        <FormItem label="功能">
                            <Button type="primary" icon={<RiseOutlined/>} className="button"
                                    style={{marginRight: '10px'}} onClick={_ => this.toTopZIndex()}>置顶</Button>
                            <Button type="danger" class="margin-left-10" className="button" icon={<DeleteOutlined/>}
                                    onClick={_ => this.deleteNode()}>删除</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }

    // 置顶
    toTopZIndex() {
        let {selectCell} = this.props;
        selectCell.toFront()
    }

    // 删除
    deleteNode() {
        let {onDeleteNode} = this.props;
        onDeleteNode && onDeleteNode()
    }

    onSwitchChange(checked) {
        let {changeGridBack} =this.props;
        this.setState({showGrid: checked})
        changeGridBack && changeGridBack(checked)
    }

    onRadioChange(e) {
        let {changeGridBack} =this.props;
        this.setState({gridType: e.target.value})
        changeGridBack && changeGridBack(e.target.value)
    }

    onGridSizeChange(value) {
        let {changeGridBack} =this.props;
        changeGridBack && changeGridBack(value)
    }
}

export default RightDrawer;
