const express = require('express');
const router = express.Router();
const precautionController = require('../controllers/precautionController');

router.get('/', precautionController.getPrecautions);

module.exports = router;
