const express = require('express');
const router = express.Router();
const externalApiController = require('../controllers/externalApiController');

router.get('/context', externalApiController.getExternalContext);

module.exports = router;
