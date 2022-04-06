import actions from "@/outter/fr-schema/src/actions"
import moment from "moment"
import { DATE_FORMAT, DATE_TIME_FORMAT } from "@/outter/fr-schema/src//moment"
import { addRemark, reverseDictValue } from "@/outter/fr-schema/src//dict"
import validator from "async-validator"
import * as _ from "lodash"

/**
 * schema字段类型
 * @type {{Select: string}}
 */
export const schemaFieldType = {
    Select: "Select",
    JsonViewer: "JsonViewer",
    AceEditor: "AceEditor",
    MultiSelect: "MultiSelect",
    DatePicker: "DatePicker",
    RangePicker: "RangePicker",
    TextArea: "TextArea",
    Password: "Password",
    TreeSelect: "TreeSelect",
    Slider: "Slider",
    Table: "Table",
    Input: "Input",
    InputNumber: "InputNumber",
    Upload: "Upload",
    Transfer: "Transfer",
    BraftEditor: "BraftEditor",
}

/**
 * 获取只读对象
 */
export function getSchemaShow(schema) {
    let result = {}

    Object.keys(schema).forEach((key) => {
        result[key] = {
            ...schema[key],
            readOnly: true,
            partialUpdate: false,
            required: false,
        }
    })

    return result
}

/**
 * get the info show column
 * @param schema
 * @returns {Array}
 */
export function getInfoColumn(schema, infoAction = actions.add) {
    let result = []
    Object.keys(schema).forEach((key) => {
        if (!schema[key]) {
            return
        }
        if (infoAction === actions.add && schema[key].addHide) {
            return
        }

        if (infoAction === actions.edit && schema[key].editHide) {
            return
        }

        if (infoAction === actions.show && schema[key].showHide) {
            return
        }

        !schema[key].infoHide && result.push({ dataIndex: key, ...schema[key] })
    })

    result.sort(function (a, b) {
        return (
            (a.orderIndex === undefined || a.orderIndex === null
                ? 9999
                : a.orderIndex) -
            (b.orderIndex === undefined || b.orderIndex === null
                ? 9999
                : b.orderIndex)
        )
    })

    return result
}

/**
 * convert the data from remote server
 * @param inData
 * @param schema
 * @returns {*}
 */
export function convertFromRemote(inData, schema) {
    let result = null
    if (inData == null || schema == null) {
        return inData
    }

    if (inData instanceof Array) {
        result = inData.map((item) => formRemote(item, schema))
    } else {
        result = formRemote(inData, schema)
    }
    return result
}

/**
 * single item convert form remote
 * @param item
 * @param schema
 * @returns {*}
 */
function formRemote(item, schema) {
    let result = item
    if (item instanceof Object) {
        result = { ...item }
    }
    Object.keys(schema).forEach((key) => {
        if (!item[key] || !schema[key]) {
            return
        }

        switch (schema[key].type) {
            case schemaFieldType.DatePicker:
                let value = item[key]
                if (!value) {
                    return null
                }

                const reg = /^[\d]+$/
                if (reg.test(value)) {
                    value = parseInt(item[key])
                }

                result[key] =
                    typeof value === "number" && value.length == 10
                        ? moment.unix(value)
                        : moment(value)
                break
        }

        // 除数
        if (schema[key].divisor) {
            result[key] = result[key] && result[key] / schema[key].divisor
        }
        if (schema[key].decimal) {
            result[key] =
                result[key] !== undefined &&
                result[key] !== null &&
                Number.parseFloat(result[key]).toFixed(schema[key].decimal)
        }
    })
    return result
}
function cutTop(arr) {
    let newArr = arr.slice(0)
    newArr.shift()
    return newArr
}

/**
 * 把数据根据定义转换成远程服务要求数据
 * @param item 数据
 * @param schema 数据定义
 * @param action 操作
 * @returns {*}
 */
function toRemote(item, schema, action = actions.edit) {
    if (!schema || item instanceof FormData) {
        return item
    }

    let result = { ...item }
    Object.keys(schema).forEach((key) => {
        if (
            action === actions.edit &&
            schema[key].readOnly &&
            !schema[key].primaryKey
        ) {
            delete result[key]
            return
        }

        if (!item[key]) {
            return
        }

        switch (schema[key].type) {
            case "DatePicker":
                result[key] = moment(item[key])
                if (schema[key].submitFormat) {
                    result[key] = result[key].format(schema[key].submitFormat)
                } else {
                    result[key] = result[key].valueOf()
                }

                break
            default:
        }
    })

    return result
}

/**
 * 转换数据为远程数据
 * @param data 可以是单个数据或者数组
 * @param schema
 * @param action
 * @returns {*}
 */
export const convertToRemote = (data, schema, action = actions.edit) => {
    let result
    if (data instanceof Array) {
        result = data.map((item) => toRemote(item, schema, action))
    } else {
        result = toRemote(data, schema, action)
    }
    return result
}

/**
 * 获取主键key
 * @param schema
 */
export function getPrimaryKey(schema) {
    let primaryKey = "id"
    Object.keys(schema).some((key) => {
        if (schema[key] && schema[key].primaryKey) {
            primaryKey = key
            return true
        }
    })

    return primaryKey
}

/**
 * 转换到excel文件中导入的数据
 * @param data
 * @param schema
 * @param sliceNum Start with the sliceNum
 * @param errorKey Error showing data key
 */
export async function convertFormImport(
    data,
    schema,
    sliceNum = 1,
    errorKey = "id"
) {
    // 转换schema 根据 中文标题做key
    let convertMap = {}
    Object.keys(schema).forEach((dataIndex) => {
        const fieldDefine = schema[dataIndex]
        console.log(schema[dataIndex])
        convertMap[fieldDefine.title] = { ...schema[dataIndex], dataIndex }
    })

    console.log(convertMap)
    // 添加 A,B,C，D... 等的匹配
    Object.keys(data[0]).forEach((key) => {
        console.log(data[0][key])
        convertMap[key] = convertMap[data[0][key]] || {
            dataIndex: data[0][key],
            title: data[0][key],
        }
    })
    console.log(convertMap)
    // 生成validate descriptor
    let descriptor = {}
    Object.keys(schema).forEach((key) => {
        const { required, rules } = schema[key]
        descriptor[key] = {
            required,
            ...(rules || {}),
        }
    })

    // 批量验证
    let dataResult = []
    let throwMessage = null
    const handlePromiseList = data.slice(sliceNum).map((item) => {
        return new Promise(async (resolve, reject) => {
            let result = {}

            // convert the data
            let lastFiledDefine = null
            Object.keys(item).forEach((key) => {
                let filedDefine = convertMap[key]
                console.log(item)
                console.log(filedDefine)
                if (!filedDefine) {
                    filedDefine = lastFiledDefine
                }

                if (_.isNil(filedDefine) || filedDefine.addHide) {
                    return
                }

                // 获取key
                const realKey = filedDefine.dataIndex
                if (!realKey) {
                    return
                }
                console.log(realKey)
                // 获取值
                lastFiledDefine = filedDefine
                let value = item[key]

                if (filedDefine.dict) {
                    value = reverseDictValue(value, filedDefine.dict)
                }

                if (_.isNil(result[realKey])) {
                    result[realKey] = value
                } else if (result[realKey] instanceof Array) {
                    result[realKey].push(value)
                } else {
                    result[realKey] = [result[realKey], value]
                }

                if (result[realKey] instanceof Array) {
                    let temp = []
                    result[realKey].forEach((item) => {
                        if (!_.isNil(item) && item.trim() !== "") {
                            temp.push(item)
                        }
                    })

                    result[realKey] = temp
                }
            })

            //  校验
            try {
                await new validator(descriptor).validate(
                    result,
                    (errors, fields) => {
                        if (errors) {
                            console.error("item", item)
                            console.error("errors", errors)
                            console.error("fields", fields)

                            let errorStr = ""
                            errors.forEach((error) => {
                                errorStr += `字段[${
                                    schema[error.field].title
                                }]错误[${error.message}];`
                            })

                            throwMessage = `数据出现问题: ${errorStr}。`
                            reject(throwMessage)
                        }
                    }
                )
            } catch (error) {}

            const convertResult = toRemote(result, schema, actions.add)
            resolve(convertResult)
        })
    })

    await Promise.all(handlePromiseList)
        .then((allResult) => {
            dataResult = allResult
        })
        .catch(function () {
            throw new Error(throwMessage)
        })

    return dataResult
}

/**
 * docorate list show Humanize
 * @param list
 * @param schema
 * @returns {*|any[]}
 */
export function decorateList(list, schema) {
    return list.map((item) => {
        return decorateItem(item, schema)
    })
}

/**
 * 渲染单个数据
 * @param item
 * @param schema
 * @returns {any[]}
 */
export function decorateItem(item, schema) {
    // 检查
    if (!schema || !item) {
        return item
    }

    let result = { ...item }
    result = addRemark(result, schema)

    Object.keys(schema).forEach((key) => {
        switch (schema[key].type) {
            case "DatePicker":
                if (!item[key]) {
                    break
                }

                if (!item[key].format) {
                    break
                }

                if (schema[key].props && schema[key].props.showTime) {
                    result[key + "_remark"] =
                        item[key] && item[key].format(DATE_TIME_FORMAT)
                } else {
                    result[key + "_remark"] =
                        item[key] && item[key].format(DATE_FORMAT)
                }
                break
            case schemaFieldType.MultiSelect:
            case schemaFieldType.Select:
                if (result[key] instanceof Array) {
                    result[key + "_remark"] =
                        !_.isEmpty(item[key]) &&
                        (result[key + "_remark"]
                            ? result[key + "_remark"].join("|")
                            : result[key].join("|"))
                }
                break

            default:
                if (schema[key].unit) {
                    result[key + "_remark"] =
                        item[key] !== null &&
                        item[key] !== undefined &&
                        item[key] + schema[key].unit
                }
        }
    })

    return result
}
