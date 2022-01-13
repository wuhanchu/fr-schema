// https://umijs.org/config/
import { defineConfig } from "umi"
// import proxy from './proxy';
import routes from "./router.config"
import settingMap from "./settting"

const { REACT_APP_ENV, SETTING, IS_PROD } = process.env

//获取 setting
// 加载微应用

let setting = settingMap[SETTING] || settingMap["standard"]

let extend = {}
let BASE_PATH = setting.BASE_PATH
if (BASE_PATH) {
    extend = {
        ...extend,
        base: BASE_PATH + "/",
        publicPath: BASE_PATH + "/",
        runtimePublicPath: true,
    }
} else {
    BASE_PATH = ""
    // extend = {
    //     ...extend,
    //     base: "/",
    //     publicPath: "/",
    //     runtimePublicPath: true,
    // }
}

let config = defineConfig({
    hash: true,
    dva: {
        hmr: true,
    },

    locale: {
        // default zh-CN
        default: "zh-CN",
        // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
        baseNavigator: true,
    },
    dynamicImport: {
        loading: "@/components/PageLoading/index",
    },
    targets: {
        ie: 11,
    },
    extraBabelPlugins: [IS_PROD ? "transform-remove-console" : ""],
    // umi routes: https://umijs.org/docs/routing
    routes,
    // Theme for antd: https://ant.design/docs/react/customize-theme-cn
    theme: {
        // ...darkTheme,
        "primary-color": setting.primaryColor,
    },
    define: {
        CONFIG: setting,
        SETTING: setting,
        BASE_PATH: BASE_PATH,
    },
    mountElementId: "z_know_info",
    // qiankun: {
    //     slave: {},
    // },
    manifest: {
        basePath: "/",
    },
    ignoreMomentLocale: true,
    proxy: {
        "/api/user_auth": {
            target: process.env.AUTH_URL,
            changeOrigin: true,
            pathRewrite: { "^/api/user_auth": "" },
        },
        "/api/z_ai_service": {
            target: process.env.AI_SERVICE_URL,
            changeOrigin: true,
            pathRewrite: { "^/api/z_ai_service": "" },
        },
        "/z_know_info/api/user_auth": {
            target: process.env.AUTH_URL,
            changeOrigin: true,
            pathRewrite: { "^/z_know_info/api/user_auth": "" },
        },
        "/z_know_info/api": {
            target: process.env.SERVER_URL,
            changeOrigin: true,
            pathRewrite: { "^/z_know_info/api": "" },
        },
        "/api": {
            target: process.env.SERVER_URL,
            // target: "http://10.169.2.137:5001",
            changeOrigin: true,
            pathRewrite: { "^/api": "" },
        },
        "/zknowninfo": {
            target: "http://server.aiknown.cn:32123",
            // changeOrigin: true,
        },
    },
    ...extend,
})

export default config
