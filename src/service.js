import queryString from "query-string"
import { config, request } from "./index"
import { convertFromRemote, convertToRemote } from "./schema"
import actions from "./actions"
import * as lodash from "lodash"

export function createBasicApi(module, subModule) {
    return {
        get: async (args = {}) => {
            let url =
                "/" +
                config.apiVersion +
                module +
                (!lodash.isNil(args.id)? "/" + args.id : "") +
                (subModule? "/" + subModule : "")

            if (!lodash.isEmpty(args)) {
                url +=
                    "?" +
                    queryString.stringify({
                        ...args,
                        token: user && user.user && user.user.token
                    })
            }

            url = url.replace("//", "/")

            const response = await request({
                method: "GET",
                url
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
                    (!lodash.isNil(args.id)? args.id : "") +
                    (subModule? "/" + subModule : "")
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
                    (!lodash.isNil(args.id)? args.id : "") +
                    (subModule? "/" + subModule : "")
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
                    (subModule? "/" + subModule : "")
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
    if (data instanceof FormData) {
        return data
    }

    const formData = new FormData()
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            formData.append(key, data[key])
        }
    })
    return formData
}

/**
 * add prefix to params fit postgresql
 * @param {} params
 * @param {*} prefix
 */
function addParamPrefix(params, prefix) {
    const result = {}
    if (!prefix) {
        return params
    }

    Object.keys(params).forEach(key => {
        result[key] =
            !["select", "limit", "offset"].includes(key) &&
            params[key] &&
            params[key].toString().indexOf(".") < 1
                ? prefix + params[key]
                : params[key]
    })

    return result
}

/**
 *
 * @param module
 * @param schema
 * @param options 选项 form 使用form来传输数据
 * @param prefix default prefix condition
 * @returns {{patch: (function(*=): *), post: (function(*=): *), get: (function(*=): {pagination: {current, total, pageSize}, list: *}), delete: (function(*): *), put: (function(*=): *)}}
 */
export function createApi(
    module,
    schema = {},
    options = { form: false },
    prefix = ""
) {
    return {
        get: async (args = {}, inSchema = schema) => {
            let { currentPage, pageSize, limit, ...otherParams } = args
            // convert moment
            Object.keys(otherParams).forEach(key => {
                const item = args[key]
                if (item === undefined) {
                    return
                }
                otherParams[key] = item
            })

            limit = pageSize || limit || 10
            const response = await request(
                {
                    method: "GET",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        "?" +
                        queryString.stringify({
                            offset: limit*((currentPage || 1) - 1),
                            limit,
                            ...addParamPrefix(otherParams, prefix)
                        })
                    ).replace("//", "/")
                },
                {
                    headers: {
                        Prefer: "count=exact"
                    },
                    ...options
                }
            )

            if (!response) {
                return
            }

            const { total, list } = response || {}
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
                    ...options
                }
            )

            return response
        },
        getDetail: async (args = {}, inSchema = schema) => {
            const { id } = args

            if (!id) {
                return null
            }

            const response = await request(
                {
                    method: "GET",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        "?id=" +
                        prefix +
                        id
                    ).replace("//", "/")
                },
                {
                    headers: {
                        Accept: "application/vnd.pgrst.object+json"
                    },
                    ...options
                }
            )

            const result = convertFromRemote(response, inSchema)
            return result
        },
        post: (args, inSchema = schema) =>
            request({
                method: "POST",
                url: ("/" + config.apiVersion + module).replace("//", "/"),
                data: convertToRemote(args, inSchema || schema, actions.add)
            }),

        patch: (args, inSchema = schema) => {
            const { id, ...others } = args
            return request({
                method: "PATCH",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (!lodash.isNil(id)? "?id=" + prefix + id : "")
                ).replace("//", "/"),
                data: convertToRemote(others, inSchema || schema)
            })
        },
        put: (args, inSchema = schema) => {
            const { id, ...others } = args
            const url = (
                "/" +
                config.apiVersion +
                module +
                (!lodash.isNil(id)? "?id=" + prefix + id : "")
            ).replace("//", "/")
            return request({
                method: "PUT",
                url,
                data: convertToRemote(others, inSchema || schema)
            })
        },
        delete: args =>
            request({
                method: "DELETE",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (!lodash.isNil(args.id)? "?id=" + prefix + args.id : "")
                ).replace("//", "/")
            }),

        upInsert: (args, inSchema = schema) =>
            request(
                {
                    method: "POST",
                    url: ("/" + config.apiVersion + module).replace("//", "/"),
                    data: convertToRemote(args, inSchema || schema, actions.add)
                },
                {
                    headers: {
                        Prefer: "resolution=merge-duplicates"
                    },
                    ...options
                }
            ),
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
