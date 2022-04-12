/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {DefaultFooter} from "@ant-design/pro-layout"
import React, {useEffect, useState, createContext} from "react"
import {connect, Link, useIntl, Route} from "umi"
import {Button, Dropdown} from "antd"
import RightContent from "@/outter/fr-schema-antd-utils/src/components/GlobalHeader/RightContent"
import {Tabs, Menu, message} from 'antd';
const {TabPane} = Tabs;
import DomainList from '@/pages/domain/List';
import logo from "@/assets/logo.svg"
import Authorized from "@/outter/fr-schema-antd-utils/src/components/Authorized/Authorized"
import {DownOutlined} from "@ant-design/icons";
const config = SETTING


export const DomainKeyContext = React.createContext('default');


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
    <DefaultFooter copyright={config.copyright || ""} links={[]}/>
)


const BasicLayout = (props) => {
    let localStorageDomainKey = localStorage.getItem("domain_key");
    const [tabList, setTabList] = useState([{
        name: '域信息',
        content: <Route component={DomainList}/>,
        key: '/domain/list'
    }]); // tab列表, 初始化首页
    const [tabActiveKey, setTabActiveKey] = useState('/domain/list'); // 当前tab选中的key
    const [domainList, setDomainList] = useState([]);  // 域列表
    const [showRightMenu, setShowRightMenu] = useState(false); // 是否显示tab菜单
    const [rightClickTab, setRightClickTab] = useState({}); // 当前点击的tab项
    const [currentDomainKey, setCurrentDomainKey] = useState(localStorageDomainKey);  // 当前所选域key
    const [layoutProps, setLayoutProps] = useState({logo: logo,}); // layout样式,默认菜单栏在上面
    let tabDivObj = document.getElementById('tabDiv') // tab元素
    let tabDivWidth = tabDivObj && tabDivObj.clientWidth || 900; // 获取tab整体框宽度,以便计算最多能打开多少标签页

    // 左侧菜单栏配置
    const frameLayoutProps = {
        layout: 'leftmenu',
        style: { height: "calc(100% - 48px)" },
        menuHeaderRender: false,
        headerRender: false,
        footerRender: _ => false,
        rightContentRender: () => <></>,
    }


    const {
        dispatch,
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
        // 任意地方点击 关闭tab菜单
        window.onclick = () => {
            setShowRightMenu(false)
        }
    }, [])

    useEffect(() => {
        initCallback && initCallback()
        // 域初始化
        let domain_key = localStorage.getItem("domain_key")
        if (!domain_key) {
            localStorage.setItem("domain_key", "default")
        } else {
            if (domain_key && !props.dict.domain[domain_key]) {
                console.info('domain_key', props.dict.domain[domain_key])
            }
        }

        // 获取域列表 并显示域名称
        let domain = []
        if (props.dict) {
            Object.keys(props.dict.domain).forEach((key) => {
                domain.push(props.dict.domain[key])
            })
            setDomainList([...domain])
            props.dict.domain[localStorageDomainKey] && setCurrentDomainKey(props.dict.domain[localStorageDomainKey].key)
        }
        // 判断当前使用哪种 layout方式 根据路由配置 '/frame'开头为左侧菜单栏
        if (props.location.pathname.startsWith("/frame")) {
            setLayoutProps(frameLayoutProps)
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

    const {formatMessage} = useIntl()

    // 切换标签页
    const onTabChange = activeKey => {
        activeKey !== tabActiveKey && setShowRightMenu(false)
        setTabActiveKey(activeKey)
    };

    // 标签页操作
    const onTabEdit = (targetKey, action) => {
        // 移除单个
        if (action === 'remove') {
            tabRemove(targetKey)
        }
        // 关闭其他标签页
        if (action === 'removeOther') {
            tabRemoveOther(targetKey)
        }
    };

    // 新增标签页
    const tabAdd = (menuItem) => {
        let maxTabLength = Math.round((tabDivWidth - 130) / 118); // 最多可打开的标签页
        // 判断是否已经达到最高标签页数量
        if (tabList.length > maxTabLength) {
            message.error(`最多可打开${maxTabLength}个标签页`);
            return;
        }
        let index = tabList.findIndex((value => {
            return value.key === menuItem.key
        }));
        // 标签页不存在则新增标签页 若存在显示到对应页签
        if (index === -1) {
            tabList.push({
                name: menuItem.name,
                content: <Route component={menuItem.component}/>,
                key: menuItem.key
            })
            setTabList([...tabList])
        }
        setTabActiveKey(`${menuItem.key}`)
    };

    // 移除标签页
    const tabRemove = targetKey => {
        if (tabList.length === 1) {
            message.error('最少保留一个标签页');
            return;
        }
        const panes = tabList.filter(pane => pane.key !== targetKey);
        let activeKey = panes[panes.length - 1].key
        setTabList([...panes])
        setTabActiveKey(activeKey)
    };

    // 关闭其他便签页
    const tabRemoveOther = targetKey => {
        const panes = tabList.filter(pane => pane.key === targetKey);
        setTabList([...panes])
    }

    // 左键点击tab
    const onTabMouseDown = (activeKey, event) => {
        if (event.button === 0 && activeKey === tabActiveKey) {
            setRightClickTab(event)
            setShowRightMenu(true)
        }
    }

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
        <div style={{marginRight: '15px'}}>
            <Dropdown overlay={menu} placement="bottomLeft">
                <Button>
                    {(props.dict && props.dict.domain[currentDomainKey]?.name) || "选择数据域"}
                    <DownOutlined/>
                </Button>
            </Dropdown>
        </div>
    )

    // tab右键菜单
    const rightClickMenu = (
        showRightMenu &&
        <div style={{position: 'absolute', left: rightClickTab.clientX, top: 40, zIndex: 9999,}}>
            <Menu
                onClick={async (item) => {
                    localStorage.setItem("domain_key", item.key)
                }}
                style={{backgroundColor: '#fafafa'}}
            >
                <Menu.Item>
                    <a onClick={_ => onTabEdit(tabActiveKey, 'removeOther')}>
                        关闭其他标签页
                    </a>
                </Menu.Item>
            </Menu>
        </div>
    )

    return (
        <ProLayout
            // logo={logo}
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
                return <div onClick={_ => tabAdd(menuItemProps)}>{defaultDom}</div>
            }}
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
            rightContentRender={() => <RightContent/>}
            {...props}
            {...settings}
            {...layoutProps}
            loading={!init}
        >
            <div style={{backgroundColor: "#fff"}} id="tabDiv">
                <Tabs
                    hideAdd
                    tabBarExtraContent={operations}
                    onChange={onTabChange}
                    activeKey={tabActiveKey}
                    type="editable-card"
                    onTabClick={onTabMouseDown}
                    onEdit={onTabEdit}
                    destroyInactiveTabPane
                >
                    {tabList && tabList.map(pane => (
                        <TabPane tab={pane.name} key={pane.key}>
                            <DomainKeyContext.Provider value={currentDomainKey}>
                                {pane.content}
                            </DomainKeyContext.Provider>
                        </TabPane>
                    ))}
                </Tabs>
            </div>
            {rightClickMenu}
        </ProLayout>
    )
}

export default connect(({global, settings}) => ({
    collapsed: global.collapsed,
    init: global.init,
    settings,
    dict: global.dict,
}))(BasicLayout)
