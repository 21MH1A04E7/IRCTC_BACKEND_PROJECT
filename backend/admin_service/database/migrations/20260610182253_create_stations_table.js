/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("station", (table) => {
        table.increments("id").primary(); // Serial ID
        table.string("name").notNullable().unique();
        table.string("code").notNullable().unique();
        table.string("city").notNullable();
        table.string("state");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.integer('status').defaultTo(1);// 0 -inactive ,1 - active , 99 - block
        table.index(["name"]);
        table.index(["code"]);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("station");
};
