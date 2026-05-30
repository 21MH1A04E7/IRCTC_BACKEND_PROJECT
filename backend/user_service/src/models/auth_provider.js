const { Model } = require("objection");

class AuthProvider extends Model {
  static get tableName() {
    return "AuthProvider";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",

      required: ["provider", "providerId", "userId"],

      properties: {
        id: { type: "integer" },

        provider: { type: "string" },
        providerId: { type: "string" },

        userId: { type: "integer" },

        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./user_model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "AuthProvider.userId",
          to: "User.id",
        },
      },
    };
  }
}

module.exports = AuthProvider;