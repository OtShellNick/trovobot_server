/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function(knex) {
    return knex.schema.createTable('user', tableBuilder => {
        tableBuilder.increments('id').primary();
        tableBuilder.string('userId').notNullable().unique();
        tableBuilder.string('userName').notNullable().unique();
        tableBuilder.string('nickName').notNullable().unique();
        tableBuilder.string('email', 96).notNullable().unique();
        tableBuilder.string('profilePic').nullable().defaultTo('');
        tableBuilder.string('info').nullable().defaultTo('');
        tableBuilder.string('channelId').notNullable().unique();
        tableBuilder.string('access_token').nullable().defaultTo('');
        tableBuilder.string('token_type').notNullable().defaultTo('');
        tableBuilder.integer('expires_in').nullable().defaultTo(0);
        tableBuilder.string('refresh_token').notNullable().defaultTo('');
        tableBuilder.string('role').notNullable().defaultTo('user');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user');
};
