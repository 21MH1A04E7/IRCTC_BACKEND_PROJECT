const express = require('express');
const { createTrain } = require('../controllers/train_controller');
const { getUserContext } = require('../middlewares/getUserContext_middleware');

const router = express.Router();

router.post('/train', getUserContext, createTrain);

module.exports = router;
