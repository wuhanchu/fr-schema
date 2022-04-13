import React from "react"
import {default as tempDataList} from "@/outter/fr-schema-antd-utils/src/components/Page/DataList"
export const DataList = tempDataList
import {DomainKeyContext} from "@/layouts/TabLayout";
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
    static contextType = DomainKeyContext;

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

    componentWillReceiveProps(nextProps, nextContents) {
        /**
         * 使用16.8特性 Context方式从TabLayout传递数据到各个页面
         * nextContents为 static 定义的contextType所对应的 Context传递的数据
         * 判断是否变更 变更则重新请求数据渲染页面
         */
        if (nextContents !== this.state.localStorageDomainKey) {
            this.meta.queryArgs = {
                ...this.meta.queryArgs,
                domain_key: nextContents,
            }
            this.domainKeyChange(nextContents)
            this.refreshList();
            this.setState({localStorageDomainKey: nextContents});
        }
        super.componentWillReceiveProps(nextProps, nextContents)
    }

    // 用于各页面针对 域更改时 自定义操作
    domainKeyChange(domainKey) {}

}
export default TabList

