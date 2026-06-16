/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.dropTableIfExists("route_stations");
    await knex.schema.createTable("route_stations", (table) => {
        table.increments("id").primary();
    
        table
          .integer("route_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("routes")
          .onDelete("CASCADE");
    
        table
          .integer("station_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("station")
          .onDelete("CASCADE");
    
        table.integer("sequence_number").notNullable();
    
        table.string("arrival_time").nullable();
    
        table.string("departure_time").nullable();
    
        table.decimal("distance_from_origin", 10, 2)
          .notNullable()
          .defaultTo(0);
    
        table.unique(["route_id", "sequence_number"]);
        table.unique(["route_id", "station_id"]);
    
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists("route_stations");
};

  