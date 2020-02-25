export default [
    {
        path: "/user",
        component: "../layouts/UserLayout",
        routes: [
            {
                name: "login",
                path: "/user/login"
            },
            {
                path: "/user/login",
                name: "login",
                component: "./authority/user/Login"
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
        path: "/",
        component: "../layouts/BasicLayout",
        authority: ["admin", "user"],
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
                component: "./404"
            }
        ]
    },
    {
        component: "./404"
    }
]
