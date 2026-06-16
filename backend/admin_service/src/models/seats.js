const { Model } = require("objection");

class Seat extends Model {
  static get tableName() {
    return "seats";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["train_id", "seat_number", "seat_type", "price"],

      properties: {
        id: { type: "integer" },
        train_id: { type: "integer" },
        seat_number: { type: "integer" },
        seat_type: {
          type: "string",
          enum: ["LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "SIDE_UPPER"],
        },
        price: { type: "number" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }

  static get relationMappings() {
    const Train = require("./Train");

    return {
      train: {
        relation: Model.BelongsToOneRelation,
        modelClass: Train,
        join: {
          from: "seats.train_id",
          to: "train.id",
        },
      },
    };
  }
}

module.exports = Seat;
