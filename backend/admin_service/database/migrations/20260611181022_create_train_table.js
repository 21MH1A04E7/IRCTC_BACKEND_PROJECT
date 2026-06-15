/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("train", (table) => {
        table.increments("id").primary(); // Serial ID
        table.string("train_number").notNullable().unique();
        table.string("train_name").notNullable();
        table.string("coach_name").notNullable().defaultTo("AC");
        table.integer("total_seats").notNullable();
        table.integer("status").defaultTo(1); // 0 - Inactive, 1 - Active, 99 - Blocked
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    
        table.index(["train_number"]);
        table.index(["train_name"]);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("train"); 
};
