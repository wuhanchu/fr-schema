import frSchema from "@/outter/fr-schema/src"
import question from "@/schemas/question/index"
const config = SETTING

const GlobalModel = {
    namespace: "global",
    state: {
        collapsed: false,
        notices: [],
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
                minioConfig: call(question.service.getMinioConfig, {
                    pageSize: 10000,
                }),
            })

            // update current dict
            yield put({
                type: "save",
                payload: {
                    init: true,
                    minioConfig: res,
                },
            })
        },
    },
    reducers: {
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
