import { message } from "antd"
export const dva = {
    config: {
        onError(e) {
            console.error("dva error:" + e.message)
            e.message && message.error(e.message)
        }
    }
}

window.addEventListener("unhandledrejection", function(error, errorInfo) {
    console.error("unhandledrejection")
    error.preventDefault()
    error.reason && message.error(error.reason)
})
