/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.dropTableIfExists("seats");
    await knex.schema.createTable("seats", (table) => {
        table.increments("id").primary(); // SERIAL PRIMARY KEY
    
        table
          .integer("train_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("train")
          .onDelete("CASCADE");
    
        table.integer("seat_number").notNullable();
    
        table
          .enu("seat_type", ["LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "SIDE_UPPER"], {
            useNative: true,
            enumName: "seat_type_enum",
          })
          .notNullable();
    
        table.decimal("price", 10, 2).notNullable();
    
        table.unique(["train_id", "seat_number"]);
    
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("seats");
    await knex.raw("DROP TYPE IF EXISTS seat_type_enum");
};
  

