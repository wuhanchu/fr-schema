import React from "react"
import { connect } from "dva"
import { Redirect } from "umi"
import queryString, { stringify } from "querystring"
import PageLoading from "@/components/PageLoading"

class SecurityLayout extends React.Component {
    state = {
        isReady: false
    }

    constructor(props) {
        super(props)
        // get the query access_token
        const param = queryString.parse(location.search.replace("?", ""))
        const access_token = param.access_token
        if (access_token) {
            localStorage.setItem(
                "token",
                JSON.stringify({
                    access_token,
                    token_type: "Bearer"
                })
            )
        }
    }

    componentDidMount() {
        const { dispatch } = this.props

        if (dispatch) {
            dispatch({
                type: "user/fetchCurrent"
            })
        }

        this.setState({
            isReady: true
        })
    }

    render() {
        const { isReady } = this.state
        const { children, loading, currentUser } = this.props // You can replace it to your authentication rule (such as check token exists)
        // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）

        const isLogin = currentUser && currentUser.id
        const queryString = stringify({
            redirect: window.location.href
        })

        if ((!isLogin && loading) || !isReady) {
            return <PageLoading />
        }

        if (!isLogin) {
            return <Redirect to={`/user/login?${queryString}`}></Redirect>
        }

        return children
    }
}

export default connect(({ user, loading }) => ({
    currentUser: user.currentUser,
    loading: loading.models.user
}))(SecurityLayout)
