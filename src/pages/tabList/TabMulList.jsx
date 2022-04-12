import React from "react"
import {default as tempDataList} from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
export const DataList = tempDataList
import events from "events";
import {Tabs} from "antd";

window.events = new events.EventEmitter();

/**
 * tab标签页下又存在tab时使用
 */
class TabMulList extends React.PureComponent {
    constructor(props) {
        let domain_key = localStorage.getItem("domain_key")
        super(props);
        this.state = {
            localStorageDomainKey: domain_key,  //当前域
            tabActiveKey: '',  // tab所选key
            needListener: true, // 是否需要根据域的变化重新渲染
        }
    }

    async componentDidMount() {
        if (this.state.needListener) {
            // 注册事件监听, 当域选择更改时重新获取当前域数据
            window.events.on('domainKeyChange', (domainKey) => {
                this.setState({localStorageDomainKey: domainKey})
                this.domainKeyChange(domainKey)
                // 执行监听事件,通知父级,界面已重新渲染 (现目的: 禁止域未变更的情况下,切换tab重新渲染)
                window.events.emit('domainKeyChangeDone');
            });
        }

    }

    // 统一间距样式
    render() {
        return (
            <div style={{marginLeft: '30px', marginRight: '15px'}}>
                {this.renderTab()}
            </div>
        )
    }

    // 渲染tab
    renderTab(tabProps) {
        let {tabActiveKey} = this.state;
        return (
            <Tabs
                onChange={(tabKey) =>
                    this.setState({tabActiveKey: tabKey})
                }
                activeKey={tabActiveKey}
                {...tabProps}
            >
                {this.renderTabPane()}
            </Tabs>
        )
    }

    // tabPane为tab的单项
    renderTabPane() {
        return null
    }

    // 用于各页面针对 域更改时 自定义操作
    domainKeyChange(domainKey) {}
}

export default TabMulList

