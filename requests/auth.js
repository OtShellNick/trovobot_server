const {Server} = require('../helpers/server');

const login = (code) => {
    return Server('post', 'exchangetoken', {
        client_secret: process.env.SECRET_KEY,
        grant_type: "authorization_code",
        code,
        redirect_uri: 'http://192.168.31.37:8088/'
    })
};

const validateToken = (token) => {
    return Server('get', 'validate', {}, token)
}

const revokeToken = token => {
    return Server('post', 'revoke', {access_token: token}, token)
}

module.exports = {login, validateToken, revokeToken}