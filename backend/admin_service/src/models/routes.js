const { Model } = require("objection");

class Route extends Model {
  static get tableName() {
    return "routes";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["train_id"],

      properties: {
        id: { type: "integer" },
        train_id: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const Train = require("./train");
    const RouteStation = require("./routeStation");

    return {
      train: {
        relation: Model.BelongsToOneRelation,
        modelClass: Train,
        join: {
          from: "routes.train_id",
          to: "trains.id",
        },
      },

      routeStations: {
        relation: Model.HasManyRelation,
        modelClass: RouteStation,
        join: {
          from: "routes.id",
          to: "route_stations.route_id",
        },
      },
    };
  }
}

module.exports = Route;