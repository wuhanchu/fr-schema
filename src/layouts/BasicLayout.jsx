/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from "@ant-design/pro-layout"
import React, { useEffect } from "react"
import Link from "umi/link"
import { connect } from "dva"
import { Icon } from "antd"
import { formatMessage } from "umi-plugin-react/locale"
import Authorized from "@/utils/Authorized"
import RightContent from "@/components/GlobalHeader/RightContent"
import { isAntDesignPro } from "@/utils/utils"
import logo from "../assets/logo.svg"
import config from "@/config"

/**
 * use Authorized check all menu item
 */
const menuDataRender = menuList =>
    menuList.map(item => {
        const localItem = {
            ...item,
            children: item.children ? menuDataRender(item.children) : []
        }
        return Authorized.check(item.authority, localItem, null)
    })

const defaultFooterDom = (
    <DefaultFooter copyright={config.copyright || ""} links={[]} />
)

const footerRender = () => {
    return defaultFooterDom
}

const BasicLayout = props => {
    const { dispatch, children, user, settings } = props

    /**
     * constructor
     */

    useEffect(() => {
        if (dispatch) {
            if (user.init) {
                dispatch({
                    type: "global/queryDict"
                })
                dispatch({
                    type: "settings/getSetting"
                })
            } else {
                dispatch({
                    type: "user/fetchCurrent"
                })
            }
        }
    }, [user.init])
    /**
     * init variables
     */

    const handleMenuCollapse = payload => {
        if (dispatch) {
            dispatch({
                type: "global/changeLayoutCollapsed",
                payload
            })
        }
    }

    return (
        <ProLayout
            logo={logo}
            onCollapse={handleMenuCollapse}
            menuItemRender={(menuItemProps, defaultDom) => {
                if (menuItemProps.isUrl) {
                    return defaultDom
                }

                return <Link to={menuItemProps.path}>{defaultDom}</Link>
            }}
            breadcrumbRender={(routers = []) => [
                {
                    path: "/",
                    breadcrumbName: formatMessage({
                        id: "menu.home",
                        defaultMessage: "Home"
                    })
                },
                ...routers
            ]}
            itemRender={(route, params, routes, paths) => {
                const first = routes.indexOf(route) === 0
                return first ? (
                    <Link to={paths.join("/")}>{route.breadcrumbName}</Link>
                ) : (
                    <span>{route.breadcrumbName}</span>
                )
            }}
            formatMessage={formatMessage}
            footerRender={footerRender}
            menuDataRender={menuDataRender}
            rightContentRender={rightProps => <RightContent {...rightProps} />}
            {...props}
            {...settings}
            title={config.name}
        >
            {children}
        </ProLayout>
    )
}

export default connect(({ global, settings, user }) => ({
    collapsed: global.collapsed,
    settings,
    user
}))(BasicLayout)
