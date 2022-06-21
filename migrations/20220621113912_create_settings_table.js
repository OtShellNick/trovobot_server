/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function (knex) {
    return knex.schema.createTable('settings', tableBuilder => {
        tableBuilder.increments('id').primary();
        tableBuilder.string('userId').references('userId').inTable('user').onDelete('cascade').onUpdate('cascade');
        tableBuilder.boolean('botOn').notNullable().defaultTo(false);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('settings');
};
