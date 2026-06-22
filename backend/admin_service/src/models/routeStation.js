const { Model } = require("objection");

class RouteStation extends Model {
  static get tableName() {
    return "route_stations";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["route_id", "station_id", "sequence_number"],

      properties: {
        id: { type: "integer" },
        route_id: { type: "integer" },
        station_id: { type: "integer" },
        sequence_number: { type: "integer" },
        arrival_time: { type: ["string", "null"] },
        departure_time: { type: ["string", "null"] },
        distance_from_origin: { type: "number" },
      },
    };
  }

  static get relationMappings() {
    const Route = require("./routes");
    const Station = require("./station");

    return {
      route: {
        relation: Model.BelongsToOneRelation,
        modelClass: Route,
        join: {
          from: "route_stations.route_id",
          to: "routes.id",
        },
      },

      station: {
        relation: Model.BelongsToOneRelation,
        modelClass: Station,
        join: {
          from: "route_stations.station_id",
          to: "station.id",
        },
      },
    };
  }
}

module.exports = RouteStation;