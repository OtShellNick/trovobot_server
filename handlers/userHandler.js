const {refreshToken} = require("../requests/auth");
const {updateUserByUserId} = require("../actions/userActions");


const refreshTokenHandler = (meta, user, interval) => {
    if(interval) clearInterval(interval);

    interval = setInterval(async () => {
        try {
            const {data: authData} = await refreshToken(user.refresh_token);
            const [newUser] = await updateUserByUserId(user.userId, authData);
            meta.user = newUser;
        } catch (e) {
            console.log('error refresh token', e);
        }
    }, 3 * 60 * 60 * 1000);
}

module.exports = {refreshTokenHandler}