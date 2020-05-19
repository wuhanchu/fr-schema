import moment from "moment"

export const YEAR_FORMAT = "YYYY"
export const MONTH_FORMAT = "YYYY-MM"
export const DATE_FORMAT = "YYYY-MM-DD"
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss"
export const TME_FORMAT = "HH:mm:ss"

/**
 *毫秒转换成时间显示
 * @param {*} inSeconds 秒数
 */
export function getTimeShow(inSeconds) {
    const d = moment.duration(inSeconds, "milliseconds")
    const hours = Math.floor(d.asHours())
    const mins = Math.floor(d.asMinutes()) - hours*60
    const seconds = Math.floor(d.asSeconds()) - hours*60*60 - mins*60
    return `${hours? hours.toString().padStart(2, "0") : "00"}:${
        mins? mins.toString().padStart(2, "0") : "00"
    }:${seconds.toString().padStart(2, "0")}`
}
