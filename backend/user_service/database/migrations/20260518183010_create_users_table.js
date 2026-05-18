/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("User",(table)=>{
    table.increments("id").primary();
    table.string("firstName").notNullable();
    table.string("lastName");
    table.string("email").unique().notNullable();
    table.string("password");
    table.boolean("emailVerified").defaultTo(false);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("User")
};
