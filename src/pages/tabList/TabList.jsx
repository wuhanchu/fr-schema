import React from "react"
import {default as tempDataList} from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
export const DataList = tempDataList
import events from "events";
window.events = new events.EventEmitter();
/**
 * meta 包含
 * resource
 * service
 * title
 * selectedRows
 * scroll table whether can scroll
 */
/**
 * tab列表页
 */
class TabList extends DataList {
    constructor(props, meta) {
        const localStorageDomainKey = localStorage.getItem("domain_key")
        super(props, {
            queryArgs: {
                domain_key: meta.initLocalStorageDomainKey
                    ? localStorageDomainKey || undefined
                    : undefined,
            },
            ...meta,
        })
        this.state = { ...this.state, localStorageDomainKey }
        this.meta = { ...(this.meta || {}), ...this.props.meta }
    }

    async componentDidMount() {
        // 注册事件监听, 当域选择更改时重新获取当前域数据
        window.events.on('domainKeyChange', (domainKey) => {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: domainKey,
            }
            this.domainKeyChange(domainKey)
            this.refreshList();
            // 执行监听事件,通知父级,界面已重新渲染 (现目的: 禁止域未变更的情况下,切换tab重新渲染)
            window.events.emit('domainKeyChangeDone');
        });
        super.componentDidMount();
    }

    // 用于各页面针对 域更改时 自定义操作
    domainKeyChange(domainKey) {}

}
export default TabList

