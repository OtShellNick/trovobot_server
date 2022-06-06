/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('chatters', tableBuilder => {
      tableBuilder.specificType('roles', 'text ARRAY').notNullable().defaultTo('{}').alter();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('chatters', tableBuilder => {
        tableBuilder.specificType('roles', 'text ARRAY').notNullable().alter();
    })
};
