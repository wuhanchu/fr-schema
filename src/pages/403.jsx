import React from "react"
import { Button, Result } from "antd"
import router from "umi/router"

const Exception403 = () => (
    <Result
        status="403"
        title="403"
        subTitle="Sorry, the page you visited does not exist."
        extra={
            <Button type="primary" onClick={() => router.push("/")}>
                Back Home
            </Button>
        }
    ></Result>
)

export default Exception403
