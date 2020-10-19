export default [
    {
        path: "/user",
        component: '../outter/fr-schema-antd-utils/src/layouts/UserLayout',
        routes: [
            {
                path: "/user",
                redirect: "/user/login"
            },
            {
                path: "/user/login",
                name: "login",
                component: "./authority/user/Login"
            },
            {
                component: "404"
            }
        ]
    },
    {
        path: "/exception",
        routes: [
            {
                component: "403"
            },
            {
                component: "404"
            }
        ]
    },

    {
        path: "/outter",
        component: "../layouts/BlankLayout",
        routes: [
            {
                path: "/outter/question/search",
                name: "search",
                component: "./question/components/SearchPage"
            },
            {
                path: "/outter/question/dialogue",
                name: "dialogue",
                component: "./question/components/Dialogue"
            }
        ]
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
                        redirect: "/project"
                    },
                    {
                        path: "/project",
                        name: "project",
                        icon: "project",
                        component: "./project/List"
                    },
                    {
                        name: "system",
                        path: "/system",
                        authority: ["system"],
                        routes: [
                            {
                                path: "/system/user",
                                name: "user",
                                component: "./authority/user/List"
                            },
                            {
                                path: "/system/role",
                                name: "role",
                                component: "./authority/role/List"
                            },
                            {
                                authority: ['license_get'],
                                path: '/system/license',
                                name: 'license',
                                component: './authority/permission/license/License',
                            },
                        ]
                    },

                    {
                        component: "./404"
                    }
                ]
            }
        ]
    },
    {
        component: "./404"
    }
]
