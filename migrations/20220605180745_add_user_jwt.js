/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function(knex) {
  return knex.schema.alterTable('user', tableBuilder =>{
      tableBuilder.string('jwt').notNullable().defaultTo('');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function(knex) {
  return knex.schema.alterTable('user', tableBuilder => {
      tableBuilder.dropColumn('jwt');
  })
};
