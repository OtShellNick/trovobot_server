/**
 * @param { import("knex").Knex } knex
 * @returns {Promise<Knex.SchemaBuilder>}
 */
exports.up = async function (knex) {
    await knex.schema.alterTable('chatters', tableBuilder => {
        tableBuilder.string('channelId').notNullable().defaultTo('109186413');
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function(knex) {
    return knex.schema.alterTable('chatters', tableBuilder => {
        tableBuilder.dropColumn('channelId');
    })
};
