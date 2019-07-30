import { user as userInfo } from "./index"

const types = {
    finance: {
        approval: "approval"
    }
}

let config = {
    admin: types,
    manager: types,
    regular: []
}

const check = (permission, scope) => {
    scope = scope || config[userInfo.user.role]

    if (scope instanceof Array) {
        return scope.some(item => check(permission, item))
    } else if (scope instanceof Object) {
        return Object.values(scope).some(item => check(permission, item))
    } else {
        return permission === scope
    }
}

export default {
    types,
    config,
    check
}
