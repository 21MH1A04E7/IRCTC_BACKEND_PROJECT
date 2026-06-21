const Train = require('../models/train');
const Seat = require('../models/seats');
const { ConflictError, BadRequestError } = require('../utils/error');
const adminProducer = require('../kafka/producer/admin_producer');
const logger = require('../config/logger');

const createTrain = async (data) => {
    const { train_number, train_name, coach_name, seats } = data;

    const existing = await Train.query()
        .select('*')
        .where('train_number', train_number)
        .first();

    if (existing) {
        throw new ConflictError('Train with this number already exists');
    }

    const seatNumbers = seats.map((s) => s.seat_number);

    if (new Set(seatNumbers).size !== seatNumbers.length) {
        throw new BadRequestError('Duplicate seat numbers found');
    }

    const train = await Train.transaction(async (trx) => {
        const insertedTrain = await Train.query(trx).insertAndFetch({
            train_number,
            train_name,
            coach_name: coach_name || 'AC',
            total_seats: seats.length,
        });

        await trx(Seat.tableName).insert(
            seats.map((seat) => ({
                train_id: insertedTrain.id,
                seat_number: seat.seat_number,
                seat_type: seat.seat_type,
                price: seat.price,
            }))
        );

        return insertedTrain;
    });

    const trainSeats = await Seat.query()
        .where('train_id', train.id)
        .orderBy('seat_number', 'asc');

    const result = { ...train, seats: trainSeats };

    adminProducer.publishTrainCreated(result).catch((err) => {
        logger.error('Failed to publish train created event', { error: err.message });
    });

    return result;
};

module.exports = { createTrain };
