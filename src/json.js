export function isJson(str) {
    if (typeof str == "string") {
        try {
            JSON.parse(str)
            return true
        } catch (e) {
            return false
        }
    }
}
