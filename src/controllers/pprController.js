const { addHistory, getScheduleByEquipment } = require('../models/pprModel');

const addPprHistory = async (req, res) => {
    try {
        const { equipment_id, schedule_id, performed_date, hours_spent, notes } = req.body;
        const performed_by = req.user.id;
        const newRecord = await addHistory(equipment_id, schedule_id, performed_date, performed_by, hours_spent, notes);
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSchedule = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const schedule = await getScheduleByEquipment(equipmentId);
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addPprHistory, getSchedule };