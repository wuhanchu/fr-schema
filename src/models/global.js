import frSchema from "@/outter/fr-schema/src"
import question from "@/schemas/question/index"

import domain from "@/schemas/domain/index"
import configService from "@/schemas/config/service"
import dictService from "@/schemas/dict/service"

import { useState } from "react"

export function useGridAttr() {
    const [gridAttrs, setGridAttrs] = useState({
        type: "mesh",
        size: 10,
        color: "#e5e5e5",
        thickness: 1,
        colorSecond: "#d0d0d0",
        thicknessSecond: 1,
        factor: 4,
        bgColor: "transparent",
        showImage: true,
        repeat: "watermark",
        angle: 30,
        position: "center",
        bgSize: JSON.stringify({ width: 150, height: 150 }),
        opacity: 0.1,
    })
    const setGridAttr = (key, value) => {
        setGridAttrs((prev) => ({
            ...prev,
            [key]: value,
        }))
    }
    return {
        gridAttrs,
        setGridAttr,
    }
}

const config = SETTING
const { utils } = frSchema

const GlobalModel = {
    namespace: "global",
    state: {
        init: false,
        collapsed: false,
        notices: [],
        dict: {
            domain: {},
            config: {},
        },
        data: {
            domain: [],
            config: [],
        },
    },
    effects: {
        *fetchNotices(_, { call, put, select }) {
            const data = yield call(queryNotices)
            yield put({
                type: "saveNotices",
                payload: data,
            })
            const unreadCount = yield select(
                (state) =>
                    state.global.notices.filter((item) => !item.read).length
            )
            yield put({
                type: "user/changeNotifyCount",
                payload: {
                    totalCount: data.length,
                    unreadCount,
                },
            })
        },

        *clearNotices({ payload }, { put, select }) {
            yield put({
                type: "saveClearedNotices",
                payload,
            })
            const count = yield select((state) => state.global.notices.length)
            const unreadCount = yield select(
                (state) =>
                    state.global.notices.filter((item) => !item.read).length
            )
            yield put({
                type: "user/changeNotifyCount",
                payload: {
                    totalCount: count,
                    unreadCount,
                },
            })
        },

        *changeNoticeReadState({ payload }, { put, select }) {
            const notices = yield select((state) =>
                state.global.notices.map((item) => {
                    const notice = { ...item }

                    if (notice.id === payload) {
                        notice.read = true
                    }

                    return notice
                })
            )
            yield put({
                type: "saveNotices",
                payload: notices,
            })
            yield put({
                type: "user/changeNotifyCount",
                payload: {
                    totalCount: notices.length,
                    unreadCount: notices.filter((item) => !item.read).length,
                },
            })
        },
        *init(_, { all, call, put, select }) {
            let dict = {}
            let data = {}

            // query data

            const res = yield all({
                domain: call(domain.service.get, {
                    pageSize: 10000,
                    select: "id, name, key, base_domain_key",
                }),
                config: call(configService.get, { pageSize: 10000 }),
                dict: call(dictService.get, { pageSize: 10000 }),
            })

            Object.keys(res).forEach((key) => (data[key] = res[key].list))
            let dictMap = {}
            data.dict.forEach((item) => {
                if (!dictMap[item.key]) {
                    dictMap[item.key] = []
                }
                dictMap[item.key].push(item)
            })

            Object.keys(dictMap).forEach((key) => {
                dict[key] = utils.dict.listToDict(
                    dictMap[key],
                    null,
                    "value",
                    "name"
                )
            })
            dict.domain = utils.dict.listToDict(
                data.domain,
                null,
                "key",
                "name"
            )
            dict.config = utils.dict.listToDict(
                data.config,
                null,
                "key",
                "value"
            )

            // update current dict
            yield put({
                type: "save",
                payload: {
                    init: true,
                    dict,
                    data,
                },
            })
        },
        *initDomain(_, { all, call, put, select }) {
            let dict = {}
            let data = {}

            // query data

            const res = yield all({
                domain: call(domain.service.get, {
                    pageSize: 10000,
                    select: "id, name, key, base_domain_key",
                }),
            })

            Object.keys(res).forEach((key) => (data[key] = res[key].list))
            let dictMap = {}

            Object.keys(dictMap).forEach((key) => {
                dict[key] = utils.dict.listToDict(
                    dictMap[key],
                    null,
                    "value",
                    "name"
                )
            })
            dict.domain = utils.dict.listToDict(
                data.domain,
                null,
                "key",
                "name"
            )

            // update current dict
            yield put({
                type: "saveDomian",
                payload: {
                    init: true,
                    dict,
                    data,
                },
            })
        },
    },
    reducers: {
        save(state, action) {
            return {
                ...state,
                ...action.payload,
            }
        },
        saveDomian(state, action) {
            return {
                ...state,
                data: { ...state.data, domain: action.payload.data.domain },
                dict: { ...state.dict, domain: action.payload.dict.domain },
            }
        },
        changeLayoutCollapsed(
            state = {
                notices: [],
                collapsed: true,
            },
            { payload }
        ) {
            return { ...state, collapsed: payload }
        },

        saveNotices(state, { payload }) {
            return {
                collapsed: false,
                ...state,
                notices: payload,
            }
        },

        saveClearedNotices(
            state = {
                notices: [],
                collapsed: true,
            },
            { payload }
        ) {
            return {
                collapsed: false,
                ...state,
                notices: state.notices.filter((item) => item.type !== payload),
            }
        },
    },
    subscriptions: {
        setup({ history }) {
            // Subscribe history(url) change, trigger `load` action if pathname is `/`
            frSchema.init(config)

            history.listen(({ pathname, search }) => {
                if (typeof window.ga !== "undefined") {
                    window.ga("send", "pageview", pathname + search)
                }
            })
        },
    },
}
export default GlobalModel
