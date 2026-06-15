/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("routes", (table) => {
        table.increments("id").primary();
    
        table
          .integer("train_id")
          .unsigned()
          .notNullable()
          .unique()
          .references("id")
          .inTable("train")
          .onDelete("CASCADE");
    
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("routes");
};
