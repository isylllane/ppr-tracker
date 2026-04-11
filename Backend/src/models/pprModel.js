const pool = require('../config/db');

const getScheduleByEquipment = async (equipmentId) => {
    const result = await pool.query('SELECT * FROM ppr_schedule WHERE equipment_id = $1 ORDER BY next_due_date NULLS LAST', [equipmentId]);
    return result.rows;
};

const addHistory = async (equipmentId, scheduleId, performed_date, performed_by, hours_spent, notes) => {
    const result = await pool.query(
        `INSERT INTO ppr_history (equipment_id, schedule_id, performed_date, performed_by, hours_spent, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [equipmentId, scheduleId, performed_date, performed_by, hours_spent, notes]
    );
    if (scheduleId) {
        await pool.query(
            `UPDATE ppr_schedule 
       SET last_done_date = $1, next_due_date = $1 + (frequency_days || ' days')::INTERVAL,
           updated_at = NOW()
       WHERE id = $2`,
            [performed_date, scheduleId]
        );
    }
    return result.rows[0];
};

const getHistoryByEquipment = async (equipmentId) => {
    const result = await pool.query(
        `SELECT h.*, u.full_name as performed_by_name
     FROM ppr_history h
     LEFT JOIN users u ON h.performed_by = u.id
     WHERE h.equipment_id = $1
     ORDER BY h.performed_date DESC`,
        [equipmentId]
    );
    return result.rows;
};

module.exports = { getScheduleByEquipment, addHistory, getHistoryByEquipment };