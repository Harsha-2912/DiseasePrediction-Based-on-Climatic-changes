const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Admin only route ideally, but using general auth for now
router.post('/', auth, upload.single('dataset'), uploadController.uploadDataset);

module.exports = router;
