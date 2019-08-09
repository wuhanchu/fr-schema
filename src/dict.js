import { sysDict } from "./index"
import { schemaFieldType } from "./schema"
import clone from "clone"

export default {
    yesOrNo: {
        yes: {
            value: "1",
            remark: "是"
        },
        no: {
            value: "0",
            remark: "否"
        }
    },
    yesOrNoNum: {
        yes: {
            value: 1,
            remark: "是"
        },
        no: {
            value: 0,
            remark: "否"
        }
    },
    level: {
        normal: {
            value: "normal",
            remark: "正常",
            default: true
        },
        warn: {
            value: "warn",
            remark: "告警"
        },
        error: {
            value: "error",
            remark: "错误"
        },
        disable: {
            value: "disable",
            remark: "禁用"
        }
    }
}

/**
 * add remark to obj
 * @param obj
 * @param dict
 * @returns {any[]}
 */
export function addRemark(obj, model = {}) {
    if (obj instanceof Array) {
        obj.forEach(item => {
            Object.keys(model).forEach(key => {
                model[key].dict &&
                    (item[key + "_remark"] = convertDict(
                        item[key],
                        model[key].dict,
                        model[key].type !== schemaFieldType.Select
                    ))
            })
        })
    } else {
        Object.keys(model).forEach(key => {
            model[key].dict &&
                (obj[key + "_remark"] = convertDict(
                    obj[key],
                    model[key].dict,
                    model[key].type !== schemaFieldType.Select
                ))
        })
    }

    return obj
}

/**
 * convert value to dict reamrk
 * @param value
 * @param dict
 * @returns {*}
 */
export function convertDict(value, dict, split = true) {
    let result = null
    if (typeof value === "string" && value) {
        const list = split ? value.split && value.split(",") : [value]
        result = list.map(value => getDictValue(value, dict))
        result = result.join()
    } else {
        result = getDictValue(value, dict)
    }

    return result
}

/**
 * if shcmea have select type and have attribute (dictFunc)
 * you need call this method to conver dict value  scope
 * @param {*} inSchema current schema
 * @param {*} dict global dict
 */
export function callSchemaDictFunc(inSchema, dict) {
    let schema = clone(inSchema)

    Object.values(schema).forEach(column => {
        if (column && column.dictFunc) {
            column.dict = column.dictFunc(dict)
        }
    })

    return schema
}

/**
 * get the dict map value
 * @param value
 * @param dict
 * @returns {*}
 */
export function getDictValue(value, dict) {
    let result = null
    Object.keys(dict).some(key => {
        if (value !== undefined && value !== null) {
            String(value) == String(dict[key].value) &&
                (result = dict[key].remark)
        }

        return result
    })

    return result
}

/**
 * 反向转换备注为数值
 * @param remark
 * @param dict
 */
export function reverseDictValue(remark, dict) {
    let result = null
    Object.keys(dict).some(key => {
        if (remark !== undefined && remark !== null) {
            String(remark) == String(dict[key].remark) &&
                (result = dict[key].value)
        }

        return result
    })

    return result
}

/**
 * convert list data to schema dict
 * @param list
 */

/**
 *
 * @param list 转换的列表
 * @param condition 过滤条件
 * @param idKey 作为id 的key数值
 * @param remarkKey 作为remark的数值
 * @param showCondition 显示条件 key state校验的key，valueKey item的取值key
 */
export function listToDict(
    list,
    condition,
    idKey = "id",
    remarkKey = "name",
    showCondition
) {
    let result = {}
    if (!list) {
        console.warn("listToDict list not data")
        return result
    }
    list.forEach(item => {
        //check the dict Whether it matches
        if (condition) {
            if (
                Object.keys(condition).some(key => {
                    return item[key] !== condition[key]
                })
            ) {
                return
            }
        }

        // 设置显示逻辑
        if (showCondition) {
            const { key, valueKey } = showCondition
            if (key && item[valueKey]) {
                var tempCondition = {}
                tempCondition[key] = item[valueKey]
            }
        }

        // 返回
        result[item[idKey]] = {
            ...item,
            value: item[idKey],
            remark: item[remarkKey],
            condition: tempCondition
        }
    })
    return result
}

/**
 * 获取系统字典
 * @param type
 */
export function getSysDict(type) {
    return sysDict[type]
}
