const ClientOAuth2 = require("client-oauth2")
export const OAuthToken = ClientOAuth2.Token

import { getConfig } from "./index"

export default () => {
    let oauthConfig = getConfig()
    oauthConfig = oauthConfig.OAUTH_CONFIG
    oauthConfig.accessTokenUri = BASE_PATH + oauthConfig.accessTokenUri
    return new ClientOAuth2(oauthConfig)
}
