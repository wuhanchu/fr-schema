import React, { useEffect, useState } from "react"
import { connect } from "dva"
import queryString from "querystring"
import UserLayout from "@/outter/fr-schema-antd-utils/src/layouts/UserLayout";
import { createApi } from "@/components/ListPage/service"


const DomianUserLayout = (props) => {
    const {type} = useState("account");
    let { children, dispatch } = props

    useEffect(async () => {
        const param = queryString.parse(location.search.replace("?", ""))
        const sessionId = param.sessionId
        /**
         * sessionId 为华宝基金 域用户登录做的逻辑处理
         * 华宝基金域用户:
         *  华宝业务人员电脑登录之后,即认为做过用户认证,无需再次登录
         */
        if (sessionId) {
            sessionLogin(sessionId)
        }
    }, [])

    const sessionLogin = async (sessionId) => {
        const params = {
            sessionId: sessionId,
            systemKey: '1',
        }
        const sessionRes = await createApi('/fundpersonas/personas/ssologin', null, null, 'eq.').post({...params});
        if (sessionRes.success) {
            let user = {
                userName: sessionRes.data.userId,
                password: "123456"
            }
            if (dispatch) {
                await dispatch({
                    type: "login/login",
                    payload: {...user, type},
                })
            }
        }
    }

    return <UserLayout>{children}</UserLayout>
}

export default connect(({ global, settings, user }) => ({
    init: global.init,
    settings,
    user,
}))(DomianUserLayout)
