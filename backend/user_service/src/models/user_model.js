const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'User';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'email'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1, maxLength: 255 },
        lastName: { type: ['string', 'null'], maxLength: 255 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password:{type:'string',minLength:4,maxLength:50},
        emailVerified: { type: 'boolean', default: false },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    };
  }

  $beforeUpdate() {
    this.updatedAt = new Date();
  }

  static findByEmail(email) {
    return this.query().findOne({ email });
  }

  static findById(id) {
    return this.query().findById(id);
  }
}

module.exports = User;
