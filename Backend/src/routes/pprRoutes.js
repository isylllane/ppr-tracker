const express = require('express');
const { addPprHistory, getSchedule } = require('../controllers/pprController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/history', addPprHistory);
router.get('/schedule/:equipmentId', getSchedule);

module.exports = router;