// https://umijs.org/config/
import { defineConfig } from "umi"
// import proxy from './proxy';
import routes from "./router.config"
import settingMap from "./settting"

const { REACT_APP_ENV, SETTING } = process.env

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
    mountElementId: "know_info",
    base: "know_info",
    outputPath: `./dist/know_info`,
    publicPath: `/know_info/`,
    qiankun: {
        slave: {},
    },
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
        "/api/know_info/user_auth": {
            target: process.env.AUTH_URL,
            changeOrigin: true,
            pathRewrite: { "^/api/know_info/user_auth": "" },
        },
        "/api/know_info": {
            target: process.env.SERVER_URL,
            changeOrigin: true,
            pathRewrite: { "^/api/know_info": "" },
        },
        "/api": {
            target: process.env.SERVER_URL,
            changeOrigin: true,
            pathRewrite: { "^/api": "" },
        },
    },
    manifest: {
        basePath: "/",
    },
    ...extend,
})

export default config
