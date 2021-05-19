let { REACT_APP_ENV, BASE_PATH } = process.env

if (!BASE_PATH) {
    BASE_PATH = ""
}

export default {
    navTheme: "dark",

    // 拂晓蓝
    primaryColor: "#1890ff",
    layout: "topmenu",
    contentWidth: "Fluid",
    fixedHeader: false,
    autoHideHeader: false,
    fixSiderbar: false,
    colorWeak: false,
    menu: {
        locale: true,
    },
    pwa: false,

    // basic info
    title: "知料", // 基础信息
    product_key: "z_know_info",

    copyright: "上海掌数科技有限公司", // 版本信息

    apiVersion: BASE_PATH + "/api/",
    DATE_FORMAT: "YYYY-MM-DD",
    DATE_TIME_FORMAT: "YYYY-MM-DD HH:mm:ss",

    // oauth config
    oauth: {
        clientId: "yAl9PO9sA4NKYhcrXfAOXxlD",
        clientSecret: "DarmrCkeA04rV8t8vA4mTXhMvn7nEUweE07JgvWhEVpGsukK",
        accessTokenUri: BASE_PATH + "/api/user_auth/auth/token",
        scopes: "profile",
    },

    // iconfont
    iconfontUrl: "//at.alicdn.com/t/font_1368817_ytmlcctjr8d.js",
    BASE_PATH,
    fileServer: "/file_server/",
}
