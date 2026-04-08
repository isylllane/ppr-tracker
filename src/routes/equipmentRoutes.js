const express = require('express');
const { listEquipment, getEquipmentFull, getEquipmentByQrCode, createEquipmentHandler, updateEquipmentHandler, deleteEquipmentHandler } = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/', listEquipment);
router.get('/qr/:qrCode', getEquipmentByQrCode);
router.get('/:id', getEquipmentFull);
router.post('/', roleMiddleware(['admin']), createEquipmentHandler);
router.put('/:id', roleMiddleware(['admin']), updateEquipmentHandler);
router.delete('/:id', roleMiddleware(['admin']), deleteEquipmentHandler);

module.exports = router;