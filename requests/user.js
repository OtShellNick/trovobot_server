const {Server} = require('../helpers/server');

const getUserInfo = (accessToken) => Server('get', 'getuserinfo', {}, accessToken);

module.exports = {getUserInfo}