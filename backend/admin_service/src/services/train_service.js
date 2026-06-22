const Train = require('../models/train');
const Seat = require('../models/seats');
const Route = require('../models/routes');
const RouteStation = require('../models/routeStation');
const Station = require('../models/station');
const { ConflictError, BadRequestError, NotFoundError } = require('../utils/error');
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

const createRoute = async (data) => {
    
    const { train_id, stations } = data;

    const train =await Train.query().where('id',train_id).first()

    if (!train) {
         throw new NotFoundError('Train not found');
    }

    const existingRoute = await Route.query().where('train_id',train_id).first();

    if (existingRoute) {
         throw new ConflictError("Route already exists for this train")
    }

    const station_ids = stations.map((station) => station.station_id);

    const existingStations = await Station.query().whereIn('id',station_ids)

    if (existingStations.length !== station_ids.length) {
         throw new BadRequestError('One or more station IDs are invalid');
    }

    const sorted = [...stations].sort((a, b) => a.sequence_number - b.sequence_number);

    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].sequence_number !== i + 1) {
            throw new BadRequestError('Sequence numbers must be continuous starting from 1');
        }
    }

    const route = await Route.transaction(async (trx) => {
        
        const insertedRoute = await Route.query(trx).insertAndFetch({ train_id });

        await trx(RouteStation.tableName).insert(
            stations.map((s) => ({
                route_id: insertedRoute.id,
                station_id: s.station_id,
                sequence_number: s.sequence_number,
                arrival_time: s.arrival_time || null,
                departure_time: s.departure_time || null,
                distance_from_origin: s.distance_from_origin ?? 0,
            }))
        );

        return insertedRoute;
    });

    const routeWithStations = await Route.query()
        .findById(route.id)
        .withGraphFetched('routeStations.station')
        .modifyGraph('routeStations', (builder) => {
            builder.orderBy('sequence_number', 'asc');
        });

    const trainSeats = await Seat.query()
        .where('train_id', train_id)
        .orderBy('seat_number', 'asc');

    adminProducer.publishRouteCreated({ ...routeWithStations, train: { ...train, seats: trainSeats } }).catch((err) => {
        logger.error('Failed to publish route created event', { error: err.message });
    });

    return routeWithStations;
};

module.exports = { createTrain,createRoute };
