import React from "react";
import logo from "@/assets/logo.svg";
import {Route} from "umi";
import DomainList from "@/pages/domain/List";

export const tabConfig = {
    // 左侧菜单栏
    frame: {
        layoutProps: {
            layout: 'leftmenu',
            style: {height: "calc(100% - 48px)"},
            menuHeaderRender: false,
            headerRender: false,
            footerRender: _ => false,
            rightContentRender: () => <></>,
        },
        initPage: [{
            name: '域信息',
            content: <Route component={DomainList}/>,
            key: '/frame/domain/list'
        }],
        initActiveKey: '/frame/domain/list',
    },
    // 顶部菜单栏
    tabs: {
        layoutProps: {logo: logo,},
        initPage: [{
            name: '域信息',
            content: <Route component={DomainList}/>,
            key: '/tabs/domain/list'
        }],
        initActiveKey: '/tabs/domain/list',
    }
}
