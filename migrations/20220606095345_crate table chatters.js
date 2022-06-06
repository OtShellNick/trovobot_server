/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function (knex) {
    return knex.schema.createTable('chatters', tableBuilder => {
        tableBuilder.increments('id').primary();
        tableBuilder.integer('sender_id').notNullable().unique();
        tableBuilder.string('nick_name').notNullable().unique();
        tableBuilder.specificType('roles', 'text ARRAY').notNullable();
        tableBuilder.integer('messages').notNullable().defaultTo(0);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function (knex) {
return knex.schema.dropTable('chatters')
};
