const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.post('/', upload.single('file'), uploadFile);

module.exports = router;