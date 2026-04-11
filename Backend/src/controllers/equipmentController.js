const { getAllEquipment, getEquipmentById, getEquipmentByQr, createEquipment, updateEquipment, deleteEquipment, getParameters } = require('../models/equipmentModel');
const { getScheduleByEquipment, getHistoryByEquipment } = require('../models/pprModel');
const { getRepairsByEquipment } = require('../models/repairModel');

const listEquipment = async (req, res) => {
    try {
        const equipment = await getAllEquipment();
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getEquipmentFull = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await getEquipmentById(id);
        if (!equipment) return res.status(404).json({ message: 'Оборудование не найдено' });
        const params = await getParameters(id);
        const schedule = await getScheduleByEquipment(id);
        const pprHistory = await getHistoryByEquipment(id);
        const repairs = await getRepairsByEquipment(id);
        res.json({ equipment, params, schedule, pprHistory, repairs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getEquipmentByQrCode = async (req, res) => {
    try {
        const { qrCode } = req.params;
        const equipment = await getEquipmentByQr(qrCode);
        if (!equipment) return res.status(404).json({ message: 'Оборудование не найдено' });
        const params = await getParameters(equipment.id);
        const schedule = await getScheduleByEquipment(equipment.id);
        const pprHistory = await getHistoryByEquipment(equipment.id);
        const repairs = await getRepairsByEquipment(equipment.id);
        res.json({ equipment, params, schedule, pprHistory, repairs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createEquipmentHandler = async (req, res) => {
    try {
        const newEquipment = await createEquipment(req.body);
        res.status(201).json(newEquipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateEquipmentHandler = async (req, res) => {
    try {
        const updated = await updateEquipment(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Оборудование не найдено' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteEquipmentHandler = async (req, res) => {
    try {
        await deleteEquipment(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const QRCode = require('qrcode')

const generateQrCode = async (req, res) => {
    try {
        const { id } = req.params
        const equipment = await getEquipmentById(id)
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' })
        }

        // Формируем URL для перехода после сканирования
        // Для локальной разработки
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const url = `${frontendUrl}/equipment/qr/${equipment.qr_code}`

        // Генерируем QR-код как PNG
        const qrBuffer = await QRCode.toBuffer(url, {
            type: 'png',
            margin: 2,
            width: 300
        })

        res.setHeader('Content-Type', 'image/png')
        res.setHeader('Content-Disposition', `attachment; filename="qr-${equipment.qr_code}.png"`)
        res.send(qrBuffer)
    } catch (err) {
        console.error('QR generation error:', err)
        res.status(500).json({ message: err.message })
    }
}
module.exports = { listEquipment, getEquipmentFull, getEquipmentByQrCode, createEquipmentHandler, updateEquipmentHandler, deleteEquipmentHandler, generateQrCode };