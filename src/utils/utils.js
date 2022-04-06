import { parse } from "querystring"
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
import moments from "moment"
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/
export const isUrl = (path) => reg.test(path)
export const isAntDesignPro = () => {
    if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === "site") {
        return true
    }

    return window.location.hostname === "preview.pro.ant.design"
} // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export function decorateTime(item) {
    if (!item) {
        return "0秒"
    }

    const hour = parseInt(item / 1000 / 60 / 60, 10)
    const tempTime = moments.duration(item)
    const time = `${hour}时${tempTime.minutes()}分${tempTime.seconds()}秒`
    if (!hour && !tempTime.minutes()) {
        return `${tempTime.seconds()}秒`
    }
    if (!hour) {
        return `${tempTime.minutes()}分${tempTime.seconds()}秒`
    }
    return time
}

export const formatData = (value, n, multiple) => {
    if (multiple) {
        return (
            (Math.round(value * Math.pow(10, n)) / Math.pow(10, n)) *
            multiple
        ).toFixed(2)
    }
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
}

export const isAntDesignProOrDev = () => {
    const { NODE_ENV } = process.env

    if (NODE_ENV === "development") {
        return true
    }

    return isAntDesignPro()
}
export const getPageQuery = () => parse(window.location.href.split("?")[1])
