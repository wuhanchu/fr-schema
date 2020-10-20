export default [
    {
        path: "/user",
        component: "../outter/fr-schema-antd-utils/src/layouts/UserLayout",
        routes: [
            {
                path: "/user",
                redirect: "/user/login",
            },
            {
                path: "/user/login",
                name: "login",
                component: "./authority/user/Login",
            },
            {
                component: "404",
            },
        ],
    },
    {
        path: "/exception",
        routes: [
            {
                component: "403",
            },
            {
                component: "404",
            },
        ],
    },

    {
        path: "/outter",
        component: "../layouts/BlankLayout",
        routes: [
            {
                path: "/outter/question/search",
                name: "search",
                component: "./question/components/SearchPage",
            },
            {
                path: "/outter/question/dialogue",
                name: "dialogue",
                component: "./question/components/Dialogue",
            },
        ],
    },
    {
        path: "/out",
        component: "../layouts/BlankLayout",
        routes: [
            {
                path: "/out/project",
                name: "project",
                icon: "project",
                component: "./project/List",
            },
        ],
    },
    {
        path: "/",
        component: "../layouts/SecurityLayout",
        routes: [
            {
                path: "/",
                component: "../layouts/BasicLayout",
                routes: [
                    {
                        path: "/",
                        redirect: "/project",
                    },
                    {
                        path: "/project",
                        name: "project",
                        icon: "project",
                        component: "./project/List",
                    },
                    {
                        name: "system",
                        path: "/system",
                        authority: ["system"],
                        routes: [
                            {
                                path: "/system/user",
                                name: "user",
                                component: "./authority/user/List",
                            },
                            {
                                path: "/system/role",
                                name: "role",
                                component: "./authority/role/List",
                            },
                            {
                                authority: ["license_get"],
                                path: "/system/license",
                                name: "license",
                                component:
                                    "./authority/permission/license/License",
                            },
                        ],
                    },

                    {
                        component: "./404",
                    },
                ],
            },
        ],
    },
    {
        component: "./404",
    },
]

// /**
//  * 获取基础路径
//  * @returns {({redirect: string, path: string}|{path: string, component: string, name: string}|{path: string, routes: [{path: string, component: string, name: string}, {path: string, component: string, name: string}, {path: string, component: string, name: string}], name: string}|{path: string, routes: [{path: string, component: string, name: string}, {path: string, component: string, name: string}, {path: string, component: string, name: string}], authority: [string], name: string})[]}
//  */
// function getBasicRoutes(prefix = '') {
//     let basic = [
//         {
//             path: prefix + '/',
//             redirect: prefix + '/service',
//         },
//         {
//             name: 'project',
//             path: prefix + '/project',
//             component: "./project/List"
//         }];

//     basic = !prefix? basic.concat([{
//         name: 'system',
//         path: prefix + '/system',
//         authority: ['system'],
//         routes: [
//             {
//                 path: prefix + '/system/user',
//                 name: 'user',
//                 component: './authority/user/List',
//             },
//             {
//                 path: prefix + '/system/role',
//                 name: 'role',
//                 component: './authority/role/List',
//             },
//             {
//                 path: prefix + '/system/license',
//                 name: 'license',
//                 component: './authority/permission/license/License',
//             },
//         ],
//     }]) : basic;

//     return basic;
// }

// const routes = [
//     {
//         path: '/user',
//         component: '../outter/fr-schema-antd-utils/src/layouts/UserLayout',
//         routes: [
//             {
//                 name: 'login',
//                 path: '/user/login',
//                 component: './authority/user/Login',
//             },
//         ],
//     },
//     {
//         path: '/out',
//         component: '../outter/fr-schema-antd-utils/src/layouts/SecurityLayout',
//         routes: [
//             {
//                 path: '/out',
//                 component: '../outter/fr-schema-antd-utils/src/layouts/BlankLayout',
//                 routes: getBasicRoutes('/out'),
//             },
//         ],
//     },
//     {
//         path: '/',
//         component: '../outter/fr-schema-antd-utils/src/layouts/SecurityLayout',
//         routes: [
//             {
//                 path: '/',
//                 component: '../outter/fr-schema-antd-utils/src/layouts/BasicLayout',
//                 routes: getBasicRoutes(),
//             },
//         ],
//     },
//     {
//         component: './404',
//     },
// ];

// export default routes;
