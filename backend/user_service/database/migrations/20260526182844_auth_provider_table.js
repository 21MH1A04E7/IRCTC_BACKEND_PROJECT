/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("AuthProvider",(table)=>{
    table.increments("id").primary();
    table.string("provider").notNullable();
    table.string("providerId").notNullable();
     table
      .integer("userId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("User")
      .onDelete("CASCADE");
    table.unique(["provider", "providerId"]);
    table.unique(["userId", "provider"]);

    table.index(["userId"]);
     table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("AuthProvider");
};
