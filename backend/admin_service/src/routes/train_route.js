const express = require('express');
const { createTrain, createRoute,getAllTrains,getTrainById } = require('../controllers/train_controller');
const { getUserContext } = require('../middlewares/getUserContext_middleware');

const router = express.Router();

router.post('/train', getUserContext, createTrain);
router.post('/route', getUserContext, createRoute);

router.get("/train", getUserContext, getAllTrains);
// router.get("/train/:trainId", getUserContext, getTrainById);

module.exports = router;
