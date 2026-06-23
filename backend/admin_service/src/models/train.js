const { Model } = require("objection");

class Train extends Model {
  static get tableName() {
    return "train";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["train_number", "train_name", "total_seats"],

      properties: {
        id: { type: "integer" },
        train_number: { type: "string", minLength: 1, maxLength: 20 },
        train_name: { type: "string", minLength: 1, maxLength: 255 },
        coach_name: { type: "string", default: "AC" },
        total_seats: { type: "integer", minimum: 1 },
        status: { type: "integer", enum: [0, 1, 99] },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }
  
  static get relationMappings() {
    const Seat = require("./seats");
    const Route = require("./routes");

    return {
      seats: {
        relation: Model.HasManyRelation,
        modelClass: Seat,
        join: {
          from: 'train.id',
          to: 'seats.train_id',
        },
      },
  
      routes: {
        relation: Model.BelongsToOneRelation,
        modelClass: Route,
        join: {
          from: 'train.id',
          to: 'routes.train_id',
        },
      },
    };
  }
}

module.exports = Train;