export const basicModel = {
    state: {},
    reducers: {
        save(state, action) {
            return {
                ...state,
                ...action.payload,
            }
        },
    },
}
