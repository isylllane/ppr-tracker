const express = require('express');
const { addRepairHandler, getRepairs, getDashboardRepairs } = require('../controllers/repairController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', addRepairHandler);
router.get('/equipment/:equipmentId', getRepairs);
router.get('/dashboard/recent', getDashboardRepairs);

module.exports = router;