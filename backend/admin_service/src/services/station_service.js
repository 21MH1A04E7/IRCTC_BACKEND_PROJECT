const db = require('../db/knex');
const { ConflictError } = require('../utils/error');
const Station = require('../models/station')

const createStation = async (data) => {
    const existing = await Station.query().select('*').where("code", data.code).andWhere("status", 1).first();

    if (existing) {
        throw new ConflictError('Station code already exists')
    }

    const station = await Station.query().insert(data);
}


module.exports = { createStation }