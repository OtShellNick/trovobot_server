const {Server} = require('../helpers/server');

const getUserInfo = (accessToken) => {
    return Server('get', 'getuserinfo', {}, accessToken);
};

module.exports = {getUserInfo}