import queryString from "query-string"

import { config, request, user } from "../index"
import { convertFromRemote, convertToRemote } from "../schemas"
import actions from "./actions"

export function createBasicApi(module, subModule) {
    return {
        get: async (args = {}) => {
            const response = await request({
                method: "GET",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (args.id ? "/" + args.id : "") +
                    (subModule ? "/" + subModule + "/" : "") +
                    "/?" +
                    queryString.stringify({
                        ...args,
                        token: user && user.user && user.user.token
                    })
                ).replace("//", "/")
            })

            return response
        },

        put: args => {
            return request({
                method: "PUT",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    "/" +
                    (args.id ? args.id : "") +
                    (subModule ? "/" + subModule + "/" : "")
                ).replace("//", "/"),
                data: args
            })
        },

        patch: args => {
            return request({
                method: "PATCH",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    "/" +
                    (args.id ? args.id : "") +
                    (subModule ? "/" + subModule + "/" : "")
                ).replace("//", "/"),
                data: args
            })
        },

        post: args =>
            request({
                method: "POST",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (subModule ? "/" + subModule + "/" : "")
                ).replace("//", "/"),
                data: args
            })
    }
}

/**
 *
 * @param module
 * @param schema
 * @param options 选项
 * @returns {{patch: (function(*=): *), post: (function(*=): *), get: (function(*=): {pagination: {current, total, pageSize}, list: *}), delete: (function(*): *), put: (function(*=): *)}}
 */
export function createApi(module, schema = {}, options = {}) {
    return {
        getExtend: async (args = {}, inSchema = schema) => {
            // convert moment
            let params = {}
            Object.keys(args).forEach(key => {
                const item = args[key]
                if (item === undefined) {
                    return
                }
                params[key] = item && item.unix ? item.unix() : item
            })

            let { currentPage, pageSize, ...otherParams } = args

            const response = await request({
                method: "GET",
                url:
                    "/" +
                    config.apiVersion +
                    module +
                    "?" +
                    queryString.stringify({
                        ...otherParams,
                        page: currentPage || 1,
                        limit: pageSize || 10
                    })
            })

            let { total, records } = response || {}
            records = records || response
            return {
                list: inSchema
                    ? convertFromRemote(records || [], inSchema || schema)
                    : records,
                pagination: { current: currentPage, pageSize, total }
            }
        },
        get: async (args = {}, inSchema = schema) => {
            // convert moment
            let params = {}
            Object.keys(args).forEach(key => {
                const item = args[key]
                if (item === undefined) {
                    return
                }
                params[key] = item && item.unix ? item.unix() : item
            })

            let { currentPage, pageSize, ...otherParams } = args

            const response = await request(
                {
                    method: "GET",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        "/bulk?" +
                        queryString.stringify({
                            sort: "-id",
                            ...otherParams,
                            page: currentPage || 1,
                            limit: pageSize || 10
                        })
                    ).replace("//", "/")
                },
                {
                    // todo 需要删除缓存
                    // expirys: 60,
                    ...options
                }
            )

            const { total, records } = response || {}
            return {
                list: inSchema
                    ? convertFromRemote(records || [], inSchema || schema)
                    : records,
                pagination: { current: currentPage, pageSize, total }
            }
        },
        getDetail: async (args = {}, inSchema = schema) => {
            const { id } = args
            const response = await request(
                {
                    method: "GET",
                    url: ("/" + config.apiVersion + module + "/" + id).replace(
                        "//",
                        "/"
                    )
                },
                {
                    ...options
                }
            )

            const { result, ...others } = response

            return {
                result: convertFromRemote(result, inSchema),
                ...others
            }
        },
        post: (args, inSchema = schema) =>
            request({
                method: "POST",
                url: ("/" + config.apiVersion + module).replace("//", "/"),
                data: convertToRemote(args, inSchema || schema, actions.add)
            }),
        patch: (args, inSchema = schema) => {
            return request({
                method: "PATCH",
                url: ("/" + config.apiVersion + module).replace("//", "/"),
                data: convertToRemote(args, inSchema || schema)
            })
        },
        put: (args, inSchema = schema) => {
            return request({
                method: "PUT",
                url: "/" + config.apiVersion + module,
                data: convertToRemote(args, inSchema || schema)
            })
        },
        delete: args =>
            request({
                method: "DELETE",
                url: ("/" + config.apiVersion + module + "/" + args.id).replace(
                    "//",
                    "/"
                )
            })
    }
}
