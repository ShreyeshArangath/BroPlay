class Spotify {
    constructor(token) {
        this.accessToken = '';
        this.refreshToken = '';
        this.authorizationCode = ''
        this.userId = '';
    }

    getTokens() {
        return {
            "accessToken": this.accessToken,
            "refreshToken": this.refreshToken
        };
    }

    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    getAuthorizationCode() {
        return this.authorizationCode;
    }

    setAuthorizationCode(authorizationCode) {
        this.authorizationCode = authorizationCode;
    }

    getUserId() {
        return this.userId;
    }

    setUserId(userId) {
        this.userId = userId;
    }
}

module.exports = Spotify;