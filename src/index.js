import * as schema from "./schema"

// export other modules
import dict, * as dictUtils from "./dict"

import * as model from "./model"
import * as moment from "./moment"
import * as service from "./service"
import * as string from "./string"
import defaultRequest from "./request"
import actions from "./actions"
import oauth from "./oauth"

// 引入的数据
export let request = defaultRequest
export let config = null
export let sysDict = null
export let globalDict = null

/**
 * get current config
 */
export const getConfig = () => {
    return config
}

/**
 * schema 初始化
 * @param {s} outRequest
 * @param {*} outConfig
 * @param {*} outComponentDict
 */
const init = (outConfig, outRequest = null) => {
    config = outConfig
    if (outRequest) {
        request = outRequest
    }
}

/**
 * 初始化系统字典
 * @param value
 */
const initSysDict = value => {
    sysDict = {}
    value &&
        value.forEach(item => {
            sysDict[item.type] ||
                (sysDict[item.type] = listToDict(
                    value,
                    { type: item.type },
                    "value",
                    "label"
                ))
        })
    return sysDict
}

/**
 *  初始化全局字典
 * @param value
 */
const initGlobalDict = value => {
    globalDict = value
}

export default {
    init,
    initSysDict,
    initGlobalDict,
    params: {
        config,
        sysDict,
        globalDict
    },
    utils: {
        request,
        moment,
        string,
        dict: dictUtils
    },
    oauth,
    dict,
    actions,
    model,
    ...service,
    ...schema
}
