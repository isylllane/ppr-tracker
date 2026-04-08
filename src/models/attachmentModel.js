const pool = require('../config/db');

const addAttachment = async (ppr_history_id, repair_log_id, file_name, file_path, file_size, mime_type, uploaded_by) => {
    const result = await pool.query(
        `INSERT INTO attachments (ppr_history_id, repair_log_id, file_name, file_path, file_size, mime_type, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [ppr_history_id, repair_log_id, file_name, file_path, file_size, mime_type, uploaded_by]
    );
    return result.rows[0];
};

const getAttachmentsByPpr = async (ppr_history_id) => {
    const result = await pool.query('SELECT * FROM attachments WHERE ppr_history_id = $1', [ppr_history_id]);
    return result.rows;
};

const getAttachmentsByRepair = async (repair_log_id) => {
    const result = await pool.query('SELECT * FROM attachments WHERE repair_log_id = $1', [repair_log_id]);
    return result.rows;
};

module.exports = { addAttachment, getAttachmentsByPpr, getAttachmentsByRepair };