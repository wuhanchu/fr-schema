# fr-schema

前端的一个统一schema工具，设计schema来生成不同客户端以及不同框架的界面。

## 相关项目如下

- schema设计生成 [fr-schema](https://github.com/wuhanchu/fr-schema) 来驱动 antd pro 生成相关界面。
- antd相关
  - antd的block支持 [fr-shcema-antd-bloacks](https://github.com/wuhanchu/fr-schema-antd-blocks)。
  - antd界面的生成驱动 [fr-shcema-antd-utils](https://github.com/wuhanchu/fr-schema-antd-utils)。
- taro支持 (todo)


## 相关初始化demo

```javascript
import schemas, { listToDict } from "./schemas"
import services from "./services"

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
    services,
    schemas,
    initSysDict,
    initGlobalDict
}

```