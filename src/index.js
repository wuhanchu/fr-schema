import * as schema from './schema'
// export other modules
import dict from './dict'

import * as model from './model'
import * as momnet from './momnet'
import permission from './permission'
import * as service from './service'
import * as string from './string'
import defaultRequest from './request'

// 引入的数据
let request = defaultRequest
let config = null
let user = null
let sysDict = null
let globalDict = null

/**
 * schema 初始化
 * @param {s} outRequest
 * @param {*} outConfig
 * @param {*} outComponentDict
 */
const init = (outConfig, outRequest = null) => {
    console.log('common init start')
    request = outRequest
    if (outRequest) {
        config = outConfig
    }
    console.log('common init end')
}

/**
 * 初始化用户
 * @param outUser
 */
const initUser = outUser => {
    user = outUser
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
            'value',
            'label'
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
    initUser,
    initSysDict,
    initGlobalDict,
    params: {
        request,
        config,
        user,
        sysDict,
        globalDict,
        ComponentDict
    },
    utils: {
        dict,
        model,
        momnet,
        permission,
        string
    },
    ...service,
    ...schema
}
