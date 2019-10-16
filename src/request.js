import fetch from "dva/fetch"
import { message, notification } from "antd"
import hash from "hash.js"
import oauth, { OAuthToken } from "./oauth"
import clone from "clone"
import * as lodash from "lodash"

const codeMessage = {
    200: "服务器成功返回请求的数据。",
    201: "新增或修改数据成功。",
    202: "一个请求已经进入后台排队（异步任务）。",
    204: "删除数据成功。",
    400: "发出的请求有错误，服务器没有进行新增或修改数据的操作。",
    401: "用户没有权限（令牌、用户名、密码错误）。",
    403: "用户得到授权，但是访问是被禁止的。",
    404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
    406: "请求的格式不可得。",
    410: "请求的资源被永久删除，且不会再得到的。",
    422: "当创建一个对象时，发生一个验证错误。",
    500: "服务器发生错误，请检查服务器。",
    502: "网关错误。",
    503: "服务不可用，服务器暂时过载或维护。",
    504: "网关超时。"
}

/**
 * 检查返回数据是否是错误的
 * @param {返回对象} response
 */
const checkStatus = async response => {
    if (response.status >= 200 && response.status < 300) {
        return response
    }

    const error = new Error()
    error.status = response.status
    error.response = response
    const tempResponse = clone(response)

    try {
        const data = await tempResponse.json()
        error.message = data.message
    } catch (e) {
        error.message = `请求[${response.url}],后台返回无法解析的错误！详情查看开发工具Network标签中的相关请求。`

        throw error
    }

    throw error
}

const cachedSave = (response, hashcode) => {
    /**
     * Clone a response data and store it in sessionStorage
     * Does not support data other than json, Cache only json
     */
    const contentType = response.headers.get("Content-Type")
    if (contentType && contentType.match(/application\/json/i)) {
        // All data is saved as text
        response
            .clone()
            .text()
            .then(content => {
                sessionStorage.setItem(hashcode, content)
                sessionStorage.setItem(`${hashcode}:timestamp`, Date.now())
            })
            .catch(e => {
                console.log("cachedSave", e.message)
            })
    }
    return response
}

/**
 * create the fetch head
 */
export function getXhrOptions() {
    let options = { headers: {} }
    let token = localStorage.getItem("token")
    if (token) {
        token = JSON.parse(token)
        options.headers = [
            { key: "Authorization", value: `Bearer ${token.access_token}` }
        ]
    }

    return options
}

function isJSON(str) {
    return !lodash.isError(lodash.attempt(JSON.parse, str))
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(obj, options = {}) {
    // adapt the other param
    let url = obj
    if (obj instanceof Object) {
        url = obj.url
    }

    /**
     * Produce fingerprints based on url and parameters
     * Maybe url has the same parameters
     */
    const fingerprint = url + (options.body ? JSON.stringify(options.body) : "")
    const hashcode = hash
        .sha256()
        .update(fingerprint)
        .digest("hex")

    const defaultOptions = {
        credentials: "include"
    }
    const newOptions = {
        ...defaultOptions,
        body: obj.data,
        ...obj,
        ...options
    }
    if (
        newOptions.method === "POST" ||
        newOptions.method === "PUT" ||
        newOptions.method === "PATCH" ||
        newOptions.method === "DELETE"
    ) {
        if (!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                Accept: "application/json",
                "Content-Type": "application/json; charset=utf-8",
                ...newOptions.headers
            }
            newOptions.body = JSON.stringify(newOptions.body)
        } else {
            // newOptions.body is FormData
            newOptions.headers = {
                Accept: "application/json",
                ...newOptions.headers
            }
        }
    }

    const expirys = options.expirys
    // options.expirys !== false, return the cache,

    if (options.expirys) {
        const cached = sessionStorage.getItem(hashcode)
        const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`)
        if (cached !== null && whenCached !== null) {
            const age = (Date.now() - whenCached) / 1000
            if (age < expirys) {
                const response = new Response(new Blob([cached]))
                return response.json()
            }
            sessionStorage.removeItem(hashcode)
            sessionStorage.removeItem(`${hashcode}:timestamp`)
        }
    }

    return new Promise((resolve, reject) => {
        let token = localStorage.getItem("token")
        if (!token) {
            resolve(null)
        }

        token = JSON.parse(token)
        if (token.expires > Date.now()) {
            resolve(token)
        } else {
            return new OAuthToken(oauth(), token)
                .refresh()
                .then(token => {
                    token.data.expires = token.expires.getTime()
                    // 设置
                    localStorage.setItem("token", JSON.stringify(token.data))
                    resolve(token.data)
                })
                .catch(e => {
                    window.g_app._store.dispatch({
                        type: "login/logout"
                    })
                })
        }
    })
        .then(token => {
            if (token) {
                newOptions.headers = newOptions.headers || {}
                newOptions.headers.Authorization = `Bearer ${token.access_token}`
            }

            return fetch(url, newOptions)
        })
        .then(checkStatus)
        .then(response => cachedSave(response, hashcode))
        .then(async response => {
            // DELETE and 204 do not return data by default
            // using .json will report an error.

            // if (newOptions.method === "DELETE" || response.status === 204) {
            //     return response.text()
            // }

            const type = response.headers.get("content-type")

            //  文件
            if (type.indexOf("wav") > -1 || type.indexOf("zip") > -1) {
                return response.blob()
            } else if (type.indexOf("json") > -1) {
                const result = await response.json()

                if (result && result.errorMessage) {
                    const error = new Error(result.errorMessage)
                    error.name = response.status
                    error.response = response
                    throw error
                }

                if (result.code != "100") {
                    const error = new Error(result.msg)
                    error.name = response.status
                    error.response = response
                    throw error
                }

                return result
            } else {
                let txt = await response.text()
                // let temp = JSON.parse(txt)
                let temp = lodash.attempt(JSON.parse, txt)
                if (lodash.isError(temp)) {
                    return txt
                } else {
                    return temp
                }
            }
        })
        .catch(e => {
            const status = e.status
            if (status === 401 && window.g_app._store) {
                // @HACK
                /* eslint-disable no-underscore-dangle */
                if (!window.location.href.includes("login")) {
                    window.g_app._store.dispatch({
                        type: "login/logout"
                    })

                    notification.error({
                        message: "账户出错"
                    })
                }
                return
            }

            message.error(e.message)
            return new Promise((resolve, reject) => {
                reject(e.message)
            })
        })
}
