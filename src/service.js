import queryString from "query-string"

import { config, request, user } from "./index"
import { convertFromRemote, convertToRemote } from "./schema"
import actions from "./actions"
import { object } from "prop-types"

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
        post: args => {
            const formData = objToFrom(args)

            return request({
                method: "POST",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (subModule ? "/" + subModule + "/" : "")
                ).replace("//", "/"),
                data: formData
            })
        }
    }
}

/**
 * obj data to from
 * @param data
 * @returns {FormData}
 */
export function objToFrom(data) {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            formData.append(key, data[key])
        }
    })
    return formData
}

/**
 *
 * @param module
 * @param schema
 * @param options 选项 form 使用form来传输数据
 * @returns {{patch: (function(*=): *), post: (function(*=): *), get: (function(*=): {pagination: {current, total, pageSize}, list: *}), delete: (function(*): *), put: (function(*=): *)}}
 */
export function createApi(module, schema = {}, options = { form: false }) {
    return {
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
            const limit = pageSize || 10
            const response = await request(
                {
                    method: "GET",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        "?" +
                        queryString.stringify({
                            sort: "-id",
                            ...otherParams,
                            offset: limit * ((currentPage || 1) - 1),
                            limit
                        })
                    ).replace("//", "/")
                },
                {
                    ...options
                }
            )

            const { total, list } = response.data || {}
            return {
                list: inSchema
                    ? convertFromRemote(list || [], inSchema || schema)
                    : list,
                pagination: { current: currentPage, pageSize, total }
            }
        },
        getBasic: async (args = {}, inSchema = schema) => {
            // convert moment
            const response = await request(
                {
                    method: "GET",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        (Object.keys(args).length > 0
                            ? "?" + queryString.stringify(args)
                            : "")
                    ).replace("//", "/")
                },
                {
                    // todo 需要删除缓存
                    // expirys: 60,
                    ...options
                }
            )

            return response
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

            console.debug("data", response)
            const { data, ...others } = response

            return convertFromRemote(data, inSchema)
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
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (args.id ? "/" + args.id : "")
                ).replace("//", "/"),
                data: convertToRemote(args, inSchema || schema)
            })
        },
        put: (args, inSchema = schema) => {
            return request({
                method: "PUT",
                url:
                    "/" +
                    config.apiVersion +
                    module +
                    (args.id ? "/" + args.id : ""),
                data: convertToRemote(args, inSchema || schema)
            })
        },
        delete: args =>
            request({
                method: "DELETE",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (args.id ? "/" + args.id : "")
                ).replace("//", "/")
            }),
        deleteMulti: args =>
            request({
                method: "DELETE",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    "?" +
                    queryString.stringify(args)
                ).replace("//", "/")
            })
    }
}
