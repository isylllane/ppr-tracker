const pool = require('../config/db');

const addRepair = async (data) => {
    const { equipment_id, failure_date, description, repair_date, performed_by, cost, downtime_hours, root_cause, notes } = data;
    const result = await pool.query(
        `INSERT INTO repair_log 
     (equipment_id, failure_date, description, repair_date, performed_by, cost, downtime_hours, root_cause, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [equipment_id, failure_date, description, repair_date, performed_by, cost, downtime_hours, root_cause, notes]
    );
    return result.rows[0];
};

const getRepairsByEquipment = async (equipmentId) => {
    const result = await pool.query(
        `SELECT r.*, u.full_name as performed_by_name
     FROM repair_log r
     LEFT JOIN users u ON r.performed_by = u.id
     WHERE r.equipment_id = $1
     ORDER BY r.failure_date DESC`,
        [equipmentId]
    );
    return result.rows;
};

const getRecentRepairs = async (limit = 10) => {
    const result = await pool.query(
        `SELECT r.*, e.name as equipment_name
     FROM repair_log r
     JOIN equipment e ON r.equipment_id = e.id
     ORDER BY r.failure_date DESC
     LIMIT $1`,
        [limit]
    );
    return result.rows;
};

module.exports = { addRepair, getRepairsByEquipment, getRecentRepairs };