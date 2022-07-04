const {Server} = require('../helpers/server');
const {config} = require('../config');

const {MODE} = process.env;

const login = (code) => {
    return Server('post', 'exchangetoken', {
        client_secret: process.env.SECRET_KEY,
        grant_type: "authorization_code",
        code,
        redirect_uri: config[MODE].rest
    })
};

const validateToken = (token) => {
    return Server('get', 'validate', {}, token)
}

const revokeToken = token => {
    return Server('post', 'revoke', {access_token: token}, token)
}

const refreshToken = refresh_token => {
    return Server('post', 'refreshtoken', {
        client_secret: process.env.SECRET_KEY,
        grant_type: 'refresh_token',
        refresh_token
    })
}

module.exports = {login, validateToken, revokeToken, refreshToken}