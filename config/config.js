// https://umijs.org/config/
import { defineConfig } from 'umi';
// import proxy from './proxy';
import routes from './router.config';
import settingMap from './settting';

const { REACT_APP_ENV, SETTING } = process.env;

//获取 setting
// 加载微应用

let setting = settingMap[SETTING] || settingMap['standard'];

let extend = {};
let BASE_PATH = setting.BASE_PATH;
if (BASE_PATH) {
    extend = {
        ...extend,
        base: BASE_PATH + '/',
        publicPath: BASE_PATH + '/',
        runtimePublicPath: true,
    };
} else {
    BASE_PATH = '';
}

let config = defineConfig({
    hash: true,
    dva: {
        hmr: true,
    },

    locale: {
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
        baseNavigator: true,
    },
    dynamicImport: {
        loading: '@/components/PageLoading/index',
    },
    targets: {
        ie: 11,
    },
    // umi routes: https://umijs.org/docs/routing
    routes,
    // Theme for antd: https://ant.design/docs/react/customize-theme-cn
    theme: {
        // ...darkTheme,
        'primary-color': setting.primaryColor,
    },
    define: {
        CONFIG: setting,
        SETTING: setting,
        BASE_PATH: BASE_PATH,
    },
    // mountElementId: 'z_markgo_web',
    // base: 'z_markgo_web',
    // outputPath: `./dist/z_markgo_web`,
    // publicPath: `/z_markgo_web/`,
    // qiankun: {
    //     slave: {},
    // },
    manifest: {
        basePath: '/',
    },
    ignoreMomentLocale: true,
    proxy: {
        "/api/user_auth": {
            target: process.env.AUTH_URL,
            changeOrigin: true,
            pathRewrite: { "^/api/user_auth": "" }
        },
        "/api": {
            target: process.env.SERVER_URL,
            changeOrigin: true,
            pathRewrite: { "^/api": "" }
        },
        
    },
    manifest: {
        basePath: '/',
    },
    ...extend,
});

export default config;


