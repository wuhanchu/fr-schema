/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from "@ant-design/pro-layout"
import React, {useEffect, useState} from "react"
import { connect, Link, useIntl } from "umi"
import {Button, Dropdown, Menu, Result} from "antd"
import RightContent from "@/outter/fr-schema-antd-utils/src/components/GlobalHeader/RightContent"

import logo from "@/assets/logo.svg"

import Authorized from "@/outter/fr-schema-antd-utils/src/components/Authorized/Authorized"
import {DownOutlined} from "@ant-design/icons";

const config = SETTING
const noMatch = (
    <Result
        status={403}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
            <Button type="primary">
                <Link to="/user/login">Go Login</Link>
            </Button>
        }
    />
)

import {DomainKeyContext} from "@/layouts/TabLayout";

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList) =>
    menuList.map((item) => {
        const localItem = {
            ...item,
            children: item.children ? menuDataRender(item.children) : [],
        }
        return Authorized.check(item.authority, localItem, null)
    })

const defaultFooterDom = (
    <DefaultFooter copyright={config.copyright || ""} links={[]} />
)

const BasicLayout = (props) => {
    let localStorageDomainKey = localStorage.getItem("domain_key");
    const [currentDomainKey, setCurrentDomainKey] = useState(localStorageDomainKey);  // 当前所选域key
    const [domainList, setDomainList] = useState([]);  // 域列表
    const {
        dispatch,
        children,
        settings,
        init,
        initCallback,

        location = {
            pathname: "/",
        },
    } = props
    /**
     * constructor
     */

    useEffect(() => {
        if (dispatch) {
            dispatch({
                type: "global/init",
            })
        }

        // 域初始化
        let domain_key = localStorage.getItem("domain_key")
        if (!domain_key) {
            localStorage.setItem("domain_key", "default")
        }
        if (domain_key && !!!props.dict.domain[domain_key]) {
            localStorage.setItem("domain_key", "default")
        }
    }, [])

    useEffect(() => {
        initCallback && initCallback()

        // 获取域列表 并显示域名称
        let domain = []
        if (props.dict) {
            Object.keys(props.dict.domain).forEach((key) => {
                domain.push(props.dict.domain[key])
            })
            setDomainList([...domain])
            props.dict.domain[localStorageDomainKey] && setCurrentDomainKey(props.dict.domain[localStorageDomainKey].key)
        }
    }, [init])

    /**
     * init variables
     */

    const handleMenuCollapse = (payload) => {
        if (dispatch) {
            dispatch({
                type: "global/changeLayoutCollapsed",
                payload,
            })
        }
    } // get children authority

    const { formatMessage } = useIntl()

    // 域选择点击
    const onMenuItemClick = (item) => {
        localStorage.setItem("domain_key", item.key);  //改变缓存key
        setCurrentDomainKey(item.key);  // 更新所选key
    }

    // 域选择菜单
    const menu = (
        <Menu
            onClick={async (item) => onMenuItemClick(item)}
        >
            {domainList &&
            domainList.map((item) => {
                return (
                    <Menu.Item key={item.key}>
                        <a>{item.name}</a>
                    </Menu.Item>
                )
            })}
        </Menu>
    )

    // 域选择框
    const operations = (
        <div style={{marginTop: '-10px', height: '40px'}}>
            <Dropdown overlay={menu} placement="bottomLeft">
                <Button style={{position: 'absolute', right: 0}}>
                    {(props.dict && props.dict.domain[currentDomainKey]?.name) || "选择数据域"}
                    <DownOutlined/>
                </Button>
            </Dropdown>
        </div>
    )

    return (
        <ProLayout
            logo={logo}
            formatMessage={formatMessage}
            menuHeaderRender={(logoDom, titleDom) => (
                <Link to={"/"}>
                    {logoDom}
                    {titleDom}
                </Link>
            )}
            onCollapse={handleMenuCollapse}
            menuItemRender={(menuItemProps, defaultDom) => {
                if (
                    menuItemProps.isUrl ||
                    menuItemProps.children ||
                    !menuItemProps.path
                ) {
                    return defaultDom
                }

                return <Link to={menuItemProps.path}>{defaultDom}</Link>
            }}
            breadcrumbRender={(routers = []) =>{
                return [
                    {
                        path: "/",
                        redirect: "/",
                        breadcrumbName: formatMessage({
                            id: "menu.home",
                        }),
                    },
                    ...routers,
                ]}}
            itemRender={(route, params, routes, paths) => {
                const first = routes.indexOf(route) === 0
                return first ? (
                    <Link to={paths.join("/")}>{route.breadcrumbName}</Link>
                ) : (
                    <span>{route.breadcrumbName}</span>
                )
            }}
            footerRender={() => defaultFooterDom}
            menuDataRender={menuDataRender}
            rightContentRender={() => <RightContent />}
            {...props}
            {...settings}
            loading={!init}
        >
            {operations}
            <DomainKeyContext.Provider value={currentDomainKey}>
                {children}
            </DomainKeyContext.Provider>
        </ProLayout>
    )
}

export default connect(({ global, settings }) => ({
    collapsed: global.collapsed,
    init: global.init,
    settings,
    dict: global.dict,
}))(BasicLayout)
