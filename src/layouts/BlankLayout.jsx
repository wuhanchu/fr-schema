import React, { Fragment, useEffect } from "react"
import { connect } from "dva"
import queryString, { stringify } from "querystring"

const Layout = (props) => {
    let { children, dispatch, initCallback, init } = props

    useEffect(async () => {
        const param = queryString.parse(location.search.replace("?", ""))
        const access_token = param.access_token
        if (access_token) {
            localStorage.setItem(
                "token",
                JSON.stringify({
                    access_token,
                    token_type: "Bearer",
                })
            )
        }
        if (dispatch) {
            await dispatch({
                type: "global/init",
            })
        }
    }, [])

    useEffect(() => {
        initCallback && initCallback()
    }, [init])

    return <Fragment>{init && children}</Fragment>
}

export default connect(({ global, settings, user }) => ({
    init: global.init,
    settings,
    user,
}))(Layout)
