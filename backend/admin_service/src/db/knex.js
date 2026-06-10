const knex = require('knex');
const knexConfig = require('../../knexfile');
const { Model } = require('objection');

const db = knex(knexConfig.development);
Model.knex(db); 

module.exports = db;