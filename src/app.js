import { message, Collapse, Icon } from "antd"

import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
const { Panel } = Collapse

Sentry.init({
    dsn:
        "https://af5d9accf33742688741efdc0764f6bd@o261197.ingest.sentry.io/6076700",
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
})

const showError = (error) => {
    if (!error) {
        return
    }

    if (typeof error == "string") {
        message.error(error)
    } else if (error.message) {
        message.open({
            content: (
                <Collapse
                    bordered={false}
                    expandIconPosition="left"
                    expandIcon={() => (
                        <Icon style={{ color: "red" }} type="close-circle" />
                    )}
                >
                    <Panel
                        header={
                            <div>
                                {error.message} {error.detal && <a>详情</a>}
                            </div>
                        }
                        style={{
                            borderRadius: 4,
                            border: 0,
                            overflow: "hidden",
                        }}
                    >
                        <p>{error.detail}</p>
                    </Panel>
                </Collapse>
            ),
        })
    }
}

export const dva = {
    config: {
        onError(error) {
            console.error("dva error:" + error.message)
            showError(error)
            error.preventDefault && error.preventDefault()
        },
    },
}

window.addEventListener("unhandledrejection", function (error, errorInfo) {
    console.error("unhandledrejection", error)
    showError(error.reason)
    error.preventDefault && error.preventDefault()
})
