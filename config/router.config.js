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
        path: "/",
        component: "../layouts/SecurityLayout",
        routes: [
            {
                path: "/out",
                component: "../layouts/OutLayout",
                routes: [
                    {
                        path: "/out/project",
                        name: "projects",
                        icon: "project",
                        component: "./project/List",
                    },
                ],
            },
            {
                path: "/",
                component:
                    "../outter/fr-schema-antd-utils/src/layouts/BasicLayout",
                routes: [
                    {
                        path: "/",
                        redirect: "/domain/list",
                    },

                    {
                        path: "/domain",
                        name: "domain",
                        // component: "./domain/List",
                        routes: [
                            {
                                path: "/domain/list",
                                name: "domainList",
                                component: "./domain/List",
                            },

                            {
                                path: "/domain/synonym",
                                name: "synonym",
                                component: "./synonym/List",
                            },
                            {
                                path: "/domain/intent",
                                name: "intent",
                                component: "./intent/List",
                            },
                            {
                                path: "/domain/story",
                                name: "story",
                                component: "./story/List",
                            },
                        ],
                    },
                    {
                        path: "/entity",
                        name: "entity",
                        routes: [
                            {
                                path: "/entity/list",
                                name: "entityList",
                                component: "./entity/List",
                            },
                            {
                                path: "/entity/entityType",
                                name: "entityType",
                                component: "./entityType/List",
                            },
                        ],
                    },
                    {
                        path: "/project",
                        name: "project",
                        component: "./project/List",
                    },
                    {
                        name: "system",
                        path: "/system",
                        authority: ["system"],
                        routes: [
                            {
                                authority: ["department_get"],
                                path: "/system/department",
                                name: "department",
                                component: "./authority/department/List",
                            },
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
                                // authority: ['user_get'],
                                path: "/system/client",
                                name: "client",
                                component: "./authority/clientList/List",
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
