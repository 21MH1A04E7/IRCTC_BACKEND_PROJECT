const express = require('express');
const { createStation } = require('../controllers/station_controller');

const {getUserContext} = require('../middlewares/getUserContext_middleware');


const router = express.Router();



router.post("/station", getUserContext, createStation);

module.exports = router;