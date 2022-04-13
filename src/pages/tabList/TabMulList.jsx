import React from "react"
import {default as tempDataList} from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"

export const DataList = tempDataList
import {Tabs} from "antd";
import {DomainKeyContext} from "@/layouts/TabLayout";


/**
 * tab标签页下又存在tab时使用
 */
class TabMulList extends React.PureComponent {
    static contextType = DomainKeyContext;

    constructor(props) {
        let domain_key = localStorage.getItem("domain_key")
        super(props);
        this.state = {
            localStorageDomainKey: domain_key,  //当前域
            tabActiveKey: '',  // tab所选key
            needListener: true, // 是否需要根据域的变化重新渲染
        }
    }

    componentWillReceiveProps(nextProps, nextContents) {
        /**
         * 使用16.8特性 Context方式从TabLayout传递数据到各个页面
         * nextContents为 static 定义的contextType所对应的 Context传递的数据
         * 判断是否变更 变更则重新请求数据渲染页面
         */
        if (nextContents !== this.state.localStorageDomainKey) {
            this.setState({localStorageDomainKey: nextContents})
            this.domainKeyChange(nextContents)
        }
    }

    // 统一间距样式
    render() {
        return (
            <div style={{paddingLeft: '30px', paddingRight: '15px', backgroundColor: '#fff'}}>
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
    domainKeyChange(domainKey) {
    }
}

export default TabMulList

