import React, {Fragment, useEffect} from "react"
import {connect} from "dva";

const Layout = (props) => {

    let {children, dispatch, initCallback, init} = props;

    useEffect(async () => {
        if (dispatch) {
           await  dispatch({
                type: "global/init",
            })
        }
    }, [])

    useEffect(() => {
        initCallback && initCallback()
    }, [init])

    return (
        <Fragment>{init && children}</Fragment>
    )
}


export default connect(({ global, settings, user }) => ({
    init: global.init,
    settings,
    user,
}))(Layout)
