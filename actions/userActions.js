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

module.exports = {createUser, getUserByUserId, getUserByAccessToken};