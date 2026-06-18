const asyncHandler = require('../utils/asyncHandler')
const Joi = require('joi');
const { BadRequestError } = require('../utils/error');
const stationService=require('../services/station_service')

const createStationSchema = Joi.object({
    code: Joi.string().alphanum().min(3).max(255).required(),
    name: Joi.string().min(1).max(255).required(),
    city: Joi.string().min(1).max(225).required(),
    state: Joi.string()
})



exports.createStation = asyncHandler(async (req, res) => {
    const { error, value } = createStationSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details.map((d) => d.message).join(', '));
    }

    const { name, code, city, state } = value;
    
    const station = await stationService.createStation({
        code: code.toUpperCase(),
        name,
        city,
        state
    });

    res.status(201).json({
        success: true,
        message: 'Station Created Successfully',
        data: station
    })
})