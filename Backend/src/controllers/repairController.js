const { addRepair, getRepairsByEquipment, getRecentRepairs } = require('../models/repairModel');

const addRepairHandler = async (req, res) => {
    try {
        const repairData = { ...req.body, performed_by: req.user.id };
        const newRepair = await addRepair(repairData);
        res.status(201).json(newRepair);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getRepairs = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const repairs = await getRepairsByEquipment(equipmentId);
        res.json(repairs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDashboardRepairs = async (req, res) => {
    try {
        const repairs = await getRecentRepairs(10);
        res.json(repairs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addRepairHandler, getRepairs, getDashboardRepairs };