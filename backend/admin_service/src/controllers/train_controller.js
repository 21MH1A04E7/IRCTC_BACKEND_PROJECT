const asyncHandler = require('../utils/asyncHandler');
const Joi = require('joi');
const { BadRequestError } = require('../utils/error');
const trainService = require('../services/train_service');

const createTrainSchema = Joi.object({
    train_number: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    train_name: Joi.string().min(3).max(255).required(),
    coach_name: Joi.string().min(2).max(225),
    seats: Joi.array()
        .items(
            Joi.object({
                seat_number: Joi.number().integer().required(),
                seat_type: Joi.string()
                    .valid('LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER')
                    .required(),
                price: Joi.number().required(),
            })
        )
        .min(1)
        .required(),
});

exports.createTrain = asyncHandler(async (req, res) => {
    const { error, value } = createTrainSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details.map((d) => d.message).join(', '));
    }

    const { train_name, train_number, coach_name, seats } = value;

    const train = await trainService.createTrain({
        train_number: String(train_number),
        train_name,
        coach_name,
        seats,
    });

    res.status(201).json({
        success: true,
        message: 'Train added successfully',
        data: train,
    });
});
