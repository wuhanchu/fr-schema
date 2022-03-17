import queryString from "query-string"
import { request } from "@/outter/fr-schema/src/index"
import {
    convertFromRemote,
    convertToRemote,
} from "@/outter/fr-schema/src/schema"
import actions from "@/outter/fr-schema/src/actions"
import * as lodash from "lodash"
import { schemaFieldType } from "@/outter/fr-schema/src/schema"

const config = SETTING

/**
 * @deprecated  创建基础 API
 * @param module
 * @param subModule
 * @returns {{patch: (function(*=): *), post: (function(*=): *), get: (function(*=): *), put: (function(*=): *)}}
 */
export function createBasicApi(module, subModule) {
    return {
        get: async (args = {}) => {
            let url =
                "/" +
                config.apiVersion +
                module +
                (!lodash.isNil(args.id) ? "/" + args.id : "") +
                (subModule ? "/" + subModule : "")

            url = url.replace("//", "/")

            const response = await request({
                method: "GET",
                url,
            })

            return response
        },
        put: (args) => {
            return request({
                method: "PUT",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    "/" +
                    (!lodash.isNil(args.id) ? args.id : "") +
                    (subModule ? "/" + subModule : "")
                ).replace("//", "/"),
                data: args,
            })
        },
        patch: (args) => {
            return request({
                method: "PATCH",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    "/" +
                    (!lodash.isNil(args.id) ? args.id : "") +
                    (subModule ? "/" + subModule : "")
                ).replace("//", "/"),
                data: args,
            })
        },
        post: (args) => {
            const formData = objToFrom(args)

            return request({
                method: "POST",
                url: (
                    "/" +
                    config.apiVersion +
                    module +
                    (subModule ? "/" + subModule : "")
                ).replace("//", "/"),
                data: formData,
            })
        },
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
    Object.keys(data).forEach((key) => {
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

    Object.keys(params).forEach((key) => {
        result[key] =
            !["select", "limit", "offset"].includes(key) &&
            params[key] &&
            !(params[key].toString().indexOf(".") >= 0)
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
    prefix = "eq.",
    order = "id.desc"
) {
    return {
        get: async (args = {}, inSchema = schema) => {
            let { currentPage, pageSize, limit, ...otherParams } = args

            // convert moment
            Object.keys(otherParams).forEach((key) => {
                const item = args[key]
                if (item === undefined) {
                    return
                }
                otherParams[key] = item
            })

            //默认 ID 排序
            if (otherParams.order === undefined) {
                otherParams.order = order
            } else {
                if (otherParams.notNullsLast) {
                    otherParams.order = otherParams.order
                    otherParams.notNullsLast = undefined
                } else {
                    otherParams.order = otherParams.order + ".nullslast"
                }
            }

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
                            offset: limit * ((currentPage || 1) - 1),
                            limit,
                            ...addParamPrefix(otherParams, prefix),
                        })
                    ).replace("//", "/"),
                },
                {
                    headers: {
                        Prefer: "count=exact",
                    },
                    ...options,
                }
            )

            if (!response) {
                return
            }

            const { total, list, ...other } = response || {}
            return {
                list: inSchema
                    ? convertFromRemote(list || [], inSchema || schema)
                    : list,
                pagination: { current: currentPage, pageSize, total },
                other,
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
                    ).replace("//", "/"),
                },
                {
                    ...options,
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
                    ).replace("//", "/"),
                },
                {
                    headers: {
                        Accept: "application/vnd.pgrst.object+json",
                    },
                    ...options,
                }
            )

            const result = convertFromRemote(response, inSchema)
            return result
        },
        post: (args, inSchema = schema) => {
            if (!args.domain_key) {
                const localStorageDomainKey = localStorage.getItem("domain_key")

                args.domain_key = localStorageDomainKey
            }
            if (inSchema) {
                Object.keys(inSchema).forEach((key) => {
                    if (inSchema[key].type === schemaFieldType.AceEditor) {
                        if (typeof args[key] !== "object" && args[key]) {
                            args[key] = JSON.parse(args[key])
                        }
                    }
                })
            }
            return request(
                {
                    method: "POST",
                    url: ("/" + config.apiVersion + module).replace("//", "/"),
                    data: convertToRemote(
                        args,
                        inSchema || schema,
                        actions.add
                    ),
                },
                options
            )
        },

        patch: (args, inSchema = schema) => {
            if (!args.domain_key) {
                const localStorageDomainKey = localStorage.getItem("domain_key")
                args.domain_key = localStorageDomainKey
            }
            if (inSchema) {
                Object.keys(inSchema).forEach((key) => {
                    if (inSchema[key].type === schemaFieldType.AceEditor) {
                        if (typeof args[key] !== "object" && args[key]) {
                            args[key] = JSON.parse(args[key])
                        }
                    }
                })
            }

            const { id, ...others } = args

            return request(
                {
                    method: "PATCH",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        (!lodash.isNil(id)
                            ? "?id=" + (prefix ? prefix + id : id)
                            : "")
                    ).replace("//", "/"),
                    data: convertToRemote(others, inSchema || schema),
                },
                options
            )
        },
        //批量修改
        patchBatch: (args, inSchema = schema, queryArgs) => {
            const { id, ...others } = args
            return request(
                {
                    method: "PATCH",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        "/" +
                        queryString.stringify(queryArgs)
                    ).replace("//", "/"),
                    data: convertToRemote(others, inSchema || schema),
                },
                options
            )
        },
        put: (args, inSchema = schema) => {
            const { id, ...others } = args
            const url = (
                "/" +
                config.apiVersion +
                module +
                (!lodash.isNil(id) ? "?id=" + (prefix ? prefix + id : id) : "")
            ).replace("//", "/")
            return request(
                {
                    method: "PUT",
                    url,
                    data: convertToRemote(others, inSchema || schema),
                },
                options
            )
        },
        delete: (args) => {
            const localStorageDomainKey = localStorage.getItem("domain_key")
            return request(
                {
                    method: "DELETE",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        (!lodash.isNil(args.id)
                            ? "?id=" +
                              (prefix ? prefix + args.id : args.id) +
                              "&domain_key=" +
                              (prefix
                                  ? prefix + localStorageDomainKey
                                  : localStorageDomainKey)
                            : "")
                    ).replace("//", "/"),
                },
                options
            )
        },

        deleteBody: (args, inSchema = schema) => {
            const { id, ...others } = args
            return request(
                {
                    method: "DELETE",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        (!lodash.isNil(args.id)
                            ? "?id=" + (prefix ? prefix + args.id : args.id)
                            : "")
                    ).replace("//", "/"),
                    data: convertToRemote(others, inSchema || schema),
                },
                options
            )
        },

        upInsert: (args, inSchema = schema) => {
            const localStorageDomainKey = localStorage.getItem("domain_key")
            args = args.map((item) => {
                return { domain_key: localStorageDomainKey, ...item }
            })
            return request(
                {
                    method: "POST",
                    url: ("/" + config.apiVersion + module).replace("//", "/"),
                    data: convertToRemote(
                        args,
                        inSchema || schema,
                        actions.add
                    ),
                },
                {
                    headers: {
                        Prefer: "resolution=merge-duplicates",
                    },
                    ...options,
                }
            )
        },
        deleteMulti: (args) => {
            const localStorageDomainKey = localStorage.getItem("domain_key")
            if (!args.domain_key) {
                args.domain_key = prefix
                    ? prefix + localStorageDomainKey
                    : localStorageDomainKey
            }
            return request(
                {
                    method: "DELETE",
                    url: (
                        "/" +
                        config.apiVersion +
                        module +
                        "?" +
                        queryString.stringify(args)
                    ).replace("//", "/"),
                },
                options
            )
        },
    }
}
