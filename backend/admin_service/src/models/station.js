const { Model } = require("objection");

class Station extends Model {
  static get tableName() {
    return "station";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "code", "city"],

      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 1, maxLength: 255 },
        code: { type: "string", minLength: 3, maxLength: 20 },
        city: { type: "string", minLength: 1, maxLength: 255 },
        state: { type: ["string", "null"] },
        status: { type: "integer", enum: [0, 1, 99] },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }
}

module.exports = Station;