import * as schema from "./schema"
export { dict } from "./dict"
export { actions } from "./actions"
export { model } from "./model"
export { momnet } from "./momnet"
export { permission } from "./permission"
export { service } from "./service"
export { string } from "./string"


export let request = null
export let config = null
export let user = null
export let sysDict = null
export let globalDict = null

export let ComponentDict = {}

const index = (outRequest, outConfig, outComponentDict) => {
    console.log("common init start")
    request = outRequest
    config = outConfig
    ComponentDict = outComponentDict
    console.log("common init end")
}

/**
 * 初始化用户
 * @param outUser
 */
export const initUser = outUser => {
    user = outUser
}

/**
 * 初始化系统字典
 * @param value
 */
export const initSysDict = value => {
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
export const initGlobalDict = value => {
    globalDict = value
}

export default {
    init: index,
    initUser,
    initSysDict,
    initGlobalDict,
    ...schema
}