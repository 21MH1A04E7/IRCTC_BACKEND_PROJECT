/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable("schedules", (table) => {
        table.increments("id").primary();
    
        table
          .integer("train_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("train")
          .onDelete("CASCADE");
        table.date("departure_date").notNullable();
        table
          .enu("status", ["ACTIVE", "CANCELLED", "DELAYED"], {
            useNative: true,
            enumName: "schedule_status_enum",
          })
          .notNullable()
          .defaultTo("ACTIVE");
        table.timestamps(true, true);
        table.unique(["train_id", "departure_date"]);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down =async function(knex) {
    await knex.schema.dropTableIfExists("schedules");
    await knex.raw("DROP TYPE IF EXISTS schedule_status_enum");
};
