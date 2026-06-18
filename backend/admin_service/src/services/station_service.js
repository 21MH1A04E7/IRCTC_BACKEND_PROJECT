const db = require('../db/knex');
const { ConflictError } = require('../utils/error');
const Station = require('../models/station');
const adminProducer=require('../kafka/producer/admin_producer')
const logger=require('../config/logger')

const createStation = async (data) => {
    const existing = await Station.query().select('*').where("code", data.code).first();

    if (existing) {
        throw new ConflictError('Station code already exists')
    }

    const station = await Station.query().insertAndFetch(data);

    logger.info('Station Created', { id: station.id, code: station.code });

     adminProducer.publishStationCreated(station).catch((err) => {
         logger.error('Failed to publish station created event', { error: err.message });
    });
    return station;
}


module.exports = { createStation }