const knex = require('../db');

const createChatter = async (data) => {
    const [{id}] = await knex('chatters').insert(data).returning('id');
    return {...data, id};
}

const updateChatter = async (sender_id, data) => {
    return await knex('chatters').where('sender_id', '=', sender_id).update(data, ['id', 'sender_id', 'nick_name', 'roles', 'messages']);
}

const getChatterByChatterId = async (sender_id) => {
    return await knex('chatters').where({sender_id});
}

const getChattersWithMaxMessages = async () => {
    return await knex('chatters').orderBy('messages', 'desc', 'first');
}

const getChattersWithRole = async (role) => {
    return await knex('chatters').where('roles', '@>', [`${role}`]);
}

module.exports = {createChatter, updateChatter, getChattersWithMaxMessages, getChatterByChatterId, getChattersWithRole}
