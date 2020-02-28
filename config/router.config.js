export default [
    {
        path: "/user",
        component: "../layouts/UserLayout",
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
                        icon: "project",
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
                                path: "/system/license",
                                name: "license",
                                component: "./authority/permission/License"
                            }
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
