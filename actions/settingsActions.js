const knex = require('../db');

const getSettingsByUserId = async (userId) => {
    return await knex('settings').where({userId});
};

module.exports = {getSettingsByUserId}