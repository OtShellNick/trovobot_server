const knex = require('../db');

const getSettingsByUserId = async (userId) => {
    return await knex('settings').where({userId});
};

const updateSettings = async (userId, data) => {
    return await knex('settings').where({userId}).update(data, ['id', 'userId', 'botOn']);
};

const createSettings = async (userId, data) => {
    return await knex('settings').insert({userId, ...data});
}

module.exports = {getSettingsByUserId, createSettings, updateSettings}