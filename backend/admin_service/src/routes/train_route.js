const express = require('express');
const { createTrain, createRoute } = require('../controllers/train_controller');
const { getUserContext } = require('../middlewares/getUserContext_middleware');

const router = express.Router();

router.post('/train', getUserContext, createTrain);
router.post('/route', getUserContext, createRoute);

module.exports = router;
