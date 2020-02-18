import moment from "moment"
import "moment/locale/zh-cn"

moment.locale("zh-cn")

const config = {
    // basic info
    name: "antd_pro_design", // 基础信息
    desc: "antd_pro_design 演示系统", // 基础信息
    copyright: "wuhanchu", // 版本信息

    // api 前缀
    apiVersion: (BASE_PATH || "/") + "api/"
    // DATE_FORMAT: "YYYY-MM-DD",
    // DATE_TIME_FORMAT: "YYYY-MM-DD HH:mm:ss",

    // oauth config
    // OAUTH_CONFIG: {
    //     clientId: "yAl9PO9sA4NKYhcrXfAOXxlD",
    //     clientSecret: "DarmrCkeA04rV8t8vA4mTXhMvn7nEUweE07JgvWhEVpGsukK",
    //     accessTokenUri: "/oauth/token",
    //     scopes: "profile"
    // },

    // iconfont
    // iconfontUrl: "//at.alicdn.com/t/font_1368817_ytmlcctjr8d.js"
}

export default config
