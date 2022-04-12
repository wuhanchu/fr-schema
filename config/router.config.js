export default [
    {
        path: "/user",
        // component: "../outter/fr-schema-antd-utils/src/layouts/UserLayout",
        component: "../layouts/DomainUserLayout",
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
                component: "../layouts/TabLayout",
                routes: [
                    {
                        path: "/frame",
                        redirect: "/frame/domain/list",
                        title: "域列表",
                    },
                    {
                        path: "/frame/domain",
                        name: "domain",
                        icon: "CreditCardOutlined",
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
                                component: "./intent/Main",
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
                        icon: "MessageOutlined",
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
                        icon: "ProjectOutlined",
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
                        icon: "FileSearchOutlined",
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
                        path: "/frame/outboundTask",
                        name: "outboundTask",
                        icon: "PhoneOutlined",
                        routes: [
                            {
                                path: "/frame/outboundTask/list",
                                name: "taskList",
                                component: "./outboundTask/List.jsx",
                                title: "任务管理",
                            },
                            {
                                path: "/frame/outboundTask/customer",
                                name: "taskCustomer",
                                component: "./customer/List.jsx",
                                title: "客户列表",
                            },
                            {
                                path: "/frame/outboundTask/callRecord",
                                name: "callRecord",
                                component: "./callRecord/List.jsx",
                                title: "话单列表",
                            },
                        ],
                    },
                    {
                        path: "/frame/statistics",
                        name: "statistics",
                        icon: "ScheduleOutlined",
                        title: "统计",
                        component: "./statistics/List",
                    },
                    {
                        name: "system",
                        path: "/frame/system",
                        icon: "SettingOutlined",
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
        path: "/tabs",
        component: "../outter/fr-schema-antd-utils/src/layouts/SecurityLayout",
        routes: [
            {
                path: "/tabs",
                component: "../layouts/TabLayout",
                routes: [
                    {
                        path: "/tabs",
                        redirect: "/tabs/domain/list",
                        title: "域列表",
                    },
                    {
                        path: "/tab/domain",
                        name: "domain",
                        // component: "./domain/List",
                        routes: [
                            {
                                path: "/tabs/domain/list",
                                name: "domainList",
                                component: "./domain/List",
                                title: "域列表",
                            },
                            {
                                path: "/tabs/domain/synonym",
                                name: "synonym",
                                component: "./synonym/List",
                                title: "专业词汇",
                            },
                            {
                                path: "/tabs/domain/intent",
                                name: "intent",
                                component: "./intent/Main",
                                title: "意图",
                            },
                            // response
                            {
                                path: "/tabs/domain/response",
                                name: "response",
                                component: "./response/List",
                                title: "回应",
                            },
                            {
                                path: "/tabs/domain/flow",
                                name: "flow",
                                title: "话术",
                                component: "./Flow/List",
                            },

                            {
                                path: "/tabs/domain/story",
                                name: "story",
                                component: "./story/List",
                                title: "故事",
                            },
                        ],
                    },
                    {
                        path: "/tabs/conversation",
                        name: "conversation",
                        routes: [
                            {
                                path: "/tabs/conversation/list",
                                name: "conversationList",
                                component: "./conversation/list/Conversation",
                                title: "会话信息",
                            },
                        ],
                    },
                    {
                        path: "/tabs/entity",
                        name: "entity",
                        routes: [
                            {
                                path: "/tabs/entity/list",
                                name: "entityList",
                                title: "实体",
                                component: "./entity/Main",
                            },
                            {
                                path: "/tabs/entity/relation",
                                name: "relation",
                                component: "./relation/Main",
                                title: "实体关系",
                            },
                        ],
                    },

                    {
                        path: "/tabs/project",
                        name: "project",
                        title: "问题库",
                        // component: "./project/List",
                        routes: [
                            {
                                path: "/tabs/project/list",
                                name: "projectList",
                                title: "问题库信息",
                                component: "./project/List",
                            },

                            {
                                path: "/tabs/project/mark",
                                name: "mark",
                                component: "./mark/Main",
                                title: "问题库运维",
                            },
                        ],
                    },
                    {
                        path: "/tabs/outboundTask",
                        name: "outboundTask",
                        routes: [
                            {
                                path: "/tabs/outboundTask/list",
                                name: "taskList",
                                component: "./outboundTask/List.jsx",
                                title: "任务管理",
                            },
                            {
                                path: "/tabs/outboundTask/customer",
                                name: "taskCustomer",
                                component: "./customer/List.jsx",
                                title: "客户列表",
                            },
                            {
                                path: "/tabs/outboundTask/callRecord",
                                name: "callRecord",
                                component: "./callRecord/List.jsx",
                                title: "话单列表",
                            },
                        ],
                    },
                    {
                        path: "/tabs/statistics",
                        name: "statistics",
                        title: "统计",
                        component: "./statistics/List",
                    },
                    {
                        name: "system",
                        path: "/tabs/system",
                        authority: ["system"],
                        routes: [
                            {
                                path: "/tabs/system/log",
                                name: "log",
                                title: "日志管理",
                                component: "./log/List",
                            },
                            {
                                authority: ["department_get"],
                                path: "/system/department",
                                name: "department",
                                title: "部门管理",
                                component: "./authority/department/DataList",
                            },
                            {
                                path: "/tabs/system/user",
                                name: "user",
                                title: "用户管理",
                                component: "./authority/user/DataList",
                            },
                            {
                                path: "/tabs/system/role",
                                name: "role",
                                title: "角色管理",

                                component: "./authority/role/DataList",
                            },
                            {
                                authority: ["license_get"],
                                path: "/tabs/system/license",
                                name: "license",
                                title: "证书管理",
                                component:
                                    "./authority/permission/license/License",
                            },
                            {
                                path: "/tabs/system/setting",
                                name: "setting",
                                title: "设置",
                                component: "./system/Main",
                            },
                            {
                                path: "/tabs/system/config",
                                name: "config",
                                title: "系统配置",
                                component: "./config/List",
                            },
                            {
                                // authority: ['user_get'],
                                path: "/tabs/system/client",
                                name: "client",
                                title: "客户端管理",
                                component: "./authority/clientList/DataList",
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
                component:  "../layouts/DomainChooseLayout",
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
                    {
                        path: "/outboundTask",
                        name: "outboundTask",
                        routes: [
                            {
                                path: "/outboundTask/list",
                                name: "taskList",
                                component: "./outboundTask/List.jsx",
                                title: "任务管理",
                            },
                            {
                                path: "/outboundTask/customer",
                                name: "taskCustomer",
                                component: "./customer/List.jsx",
                                title: "客户列表",
                            },
                            {
                                path: "/outboundTask/callRecord",
                                name: "callRecord",
                                component: "./callRecord/List.jsx",
                                title: "话单列表",
                            },
                            // {
                            //     path: "/outboundTask/statistics",
                            //     name: "taskStatistics",
                            //     component: "./Statistics/Task.jsx",
                            //     title: "话单统计",
                            // },
                        ],
                    },
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
                                path: "/system/log",
                                name: "log",
                                title: "日志管理",
                                component: "./log/List",
                            },
                            {
                                authority: ["department_get"],
                                path: "/system/department",
                                name: "department",
                                title: "部门管理",
                                component: "./authority/department/DataList",
                            },
                            {
                                path: "/system/user",
                                name: "user",
                                title: "用户管理",
                                component: "./authority/user/DataList",
                            },
                            {
                                path: "/system/role",
                                name: "role",
                                title: "角色管理",

                                component: "./authority/role/DataList",
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
                                component: "./authority/clientList/DataList",
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
