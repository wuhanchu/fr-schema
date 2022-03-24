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
                title: "登录",
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
        path: "/frame",
        component: "../outter/fr-schema-antd-utils/src/layouts/SecurityLayout",
        routes: [
            {
                path: "/frame",
                component: "../layouts/FrameLayout",
                routes: [
                    {
                        path: "/frame",
                        redirect: "/frame/domain/list",
                        title: "域列表",
                    },
                    {
                        path: "/frame/domain",
                        name: "domain",
                        // component: "./domain/List",
                        routes: [
                            {
                                path: "/frame/domain/list",
                                name: "domainList",
                                component: "./domain/List",
                                title: "域列表",
                            },
                            {
                                path: "/frame/domain/synonym",
                                name: "synonym",
                                component: "./synonym/List",
                                title: "专业词汇",
                            },
                            {
                                path: "/frame/domain/intent",
                                name: "intent",
                                component: "./intent/List",
                                title: "意图",
                            },
                            // response
                            {
                                path: "/frame/domain/response",
                                name: "response",
                                component: "./response/List",
                                title: "回应",
                            },
                            {
                                path: "/frame/domain/flow",
                                name: "flow",
                                title: "话术",
                                component: "./Flow/List",
                            },

                            {
                                path: "/frame/domain/story",
                                name: "story",
                                component: "./story/List",
                                title: "故事",
                            },
                        ],
                    },
                    {
                        path: "/frame/conversation",
                        name: "conversation",
                        routes: [
                            {
                                path: "/frame/conversation/list",
                                name: "conversationList",
                                component: "./conversation/list/Conversation",
                                title: "会话信息",
                            },
                        ],
                    },
                    {
                        path: "/frame/entity",
                        name: "entity",
                        routes: [
                            {
                                path: "/frame/entity/list",
                                name: "entityList",
                                title: "实体",

                                component: "./entity/Main",
                            },
                            {
                                path: "/frame/entity/relation",
                                name: "relation",
                                component: "./relation/Main",
                                title: "实体关系",
                            },
                        ],
                    },

                    {
                        path: "/frame/project",
                        name: "project",
                        title: "问题库",
                        // component: "./project/List",
                        routes: [
                            {
                                path: "/frame/project/list",
                                name: "projectList",
                                title: "问题库信息",
                                component: "./project/List",
                            },

                            {
                                path: "/frame/project/mark",
                                name: "mark",
                                component: "./mark/Main",
                                title: "问题库运维",
                            },
                        ],
                    },
                    {
                        path: "/frame/statistics",
                        name: "statistics",
                        title: "统计",
                        component: "./statistics/List",
                    },
                    {
                        name: "system",
                        path: "/frame/system",
                        authority: ["system"],
                        routes: [
                            {
                                path: "/frame/system/setting",
                                name: "setting",
                                title: "设置",
                                component: "./system/Main",
                            },
                            {
                                path: "/frame/system/config",
                                name: "config",
                                title: "系统配置",
                                component: "./config/List",
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
            {
                path: "/outter/conversation",
                name: "conversation",
                component: "./conversation/list/Conversation",
            },
            {
                path: "/outter/conversation_detail",
                name: "conversationDetail",
                component: "./outPage/ConversationDetail",
            },
            {
                path: "/outter/domain/flow",
                name: "flow",
                component: "./Flow/List",
            },
            {
                path: "/outter/domain/intent",
                name: "intent",
                component: "./intent/List",
            },
            {
                path: "/outter/project",
                name: "project",
                component: "./project/List",
            },
            {
                path: "/outter/hot_word",
                name: "project",
                component: "./domain/component/HotWord",
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
                        title: "域列表",
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
                                title: "域列表",
                            },
                            {
                                path: "/domain/synonym",
                                name: "synonym",
                                component: "./synonym/List",
                                title: "专业词汇",
                            },
                            {
                                path: "/domain/intent",
                                name: "intent",
                                component: "./intent/Main",
                                title: "意图",
                            },
                            // response
                            {
                                path: "/domain/response",
                                name: "response",
                                component: "./response/List",
                                title: "回应",
                            },
                            {
                                path: "/domain/flow",
                                name: "flow",
                                title: "话术",
                                component: "./Flow/List",
                            },

                            {
                                path: "/domain/story",
                                name: "story",
                                component: "./story/List",
                                title: "故事",
                            },
                        ],
                    },
                    {
                        path: "/conversation",
                        name: "conversation",
                        routes: [
                            {
                                path: "/conversation/list",
                                name: "conversationList",
                                component: "./conversation/list/Conversation",
                                title: "会话信息",
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
                                title: "实体",

                                component: "./entity/Main",
                            },
                            {
                                path: "/entity/relation",
                                name: "relation",
                                component: "./relation/Main",
                                title: "实体关系",
                            },
                        ],
                    },

                    {
                        path: "/project",
                        name: "project",
                        title: "问题库",
                        // component: "./project/List",
                        routes: [
                            {
                                path: "/project/list",
                                name: "projectList",
                                title: "问题库信息",
                                component: "./project/List",
                            },

                            {
                                path: "/project/mark",
                                name: "mark",
                                component: "./mark/Main",
                                title: "问题库运维",
                            },
                        ],
                    },
                    // {
                    //     path: "/outboundTask",
                    //     name: "outboundTask",
                    //     routes: [
                    //         {
                    //             path: "/outboundTask/list",
                    //             name: "taskList",
                    //             component: "./outboundTask/List.jsx",
                    //             title: "任务列表",
                    //         },
                    //     ],
                    // },
                    {
                        path: "/statistics",
                        name: "statistics",
                        title: "统计",
                        component: "./statistics/List",
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
                                title: "部门管理",

                                component: "./authority/department/List",
                            },
                            {
                                path: "/system/user",
                                name: "user",
                                title: "用户管理",

                                component: "./authority/user/List",
                            },
                            {
                                path: "/system/role",
                                name: "role",
                                title: "角色管理",

                                component: "./authority/role/List",
                            },
                            {
                                authority: ["license_get"],
                                path: "/system/license",
                                name: "license",
                                title: "证书管理",
                                component:
                                    "./authority/permission/license/License",
                            },
                            {
                                path: "/system/setting",
                                name: "setting",
                                title: "设置",
                                component: "./system/Main",
                            },
                            {
                                path: "/system/config",
                                name: "config",
                                title: "系统配置",
                                component: "./config/List",
                            },
                            {
                                // authority: ['user_get'],
                                path: "/system/client",
                                name: "client",
                                title: "客户端管理",
                                component: "./authority/clientList/List",
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
