const {Server} = require('../helpers/server');
const {config} = require('../config');

const {MODE, SECRET_KEY} = process.env;

const login = (code) => Server('post', 'exchangetoken', {
    client_secret: SECRET_KEY,
    grant_type: "authorization_code",
    code,
    redirect_uri: config[MODE].rest
});

const validateToken = (token) => Server('get', 'validate', {}, token);

const revokeToken = token => Server('post', 'revoke', {access_token: token}, token);

const refreshToken = refresh_token => Server('post', 'refreshtoken', {
        client_secret: process.env.SECRET_KEY,
        grant_type: 'refresh_token',
        refresh_token
    });

module.exports = {login, validateToken, revokeToken, refreshToken}