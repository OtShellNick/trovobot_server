const knex = require('../db');

const createUser = async (data) => {
    const newUser = {...data, role: 'user'};
    const [{id}] = await knex('user').insert(newUser).returning('id');
    return {...newUser, id};
};

const getUserByUserId = async (userId) => {
    return await knex('user').where({userId});
}

const getUserByAccessToken = async (access_token) => {
    return await knex('user').where({access_token});
}

const updateUserByUserId = async (userId, data) => {
    return await knex('user').where('userId', '=', userId).update(data, ['id', 'userId', 'userName', 'nickName', 'email', 'profilePic', 'info', 'channelId', 'access_token', 'token_type', 'expires_in', 'refresh_token', 'role']);
}

module.exports = {createUser, getUserByUserId, getUserByAccessToken, updateUserByUserId};