const pool = require('../config/db');

const getAllEquipment = async () => {
    const result = await pool.query('SELECT * FROM equipment ORDER BY id');
    return result.rows;
};

const getEquipmentById = async (id) => {
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    return result.rows[0];
};

const getEquipmentByQr = async (qrCode) => {
    const result = await pool.query('SELECT * FROM equipment WHERE qr_code = $1', [qrCode]);
    return result.rows[0];
};

const createEquipment = async (data) => {
    const { name, model, serial_number, location, qr_code } = data;
    const result = await pool.query(
        `INSERT INTO equipment (name, model, serial_number, location, qr_code)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, model, serial_number, location, qr_code]
    );
    return result.rows[0];
};

const updateEquipment = async (id, data) => {
    const fields = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = $${i}`);
            values.push(value);
            i++;
        }
    }
    values.push(id);
    const query = `UPDATE equipment SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteEquipment = async (id) => {
    await pool.query('DELETE FROM equipment WHERE id = $1', [id]);
};

const getParameters = async (equipmentId) => {
    const result = await pool.query('SELECT param_name, param_value FROM equipment_parameters WHERE equipment_id = $1', [equipmentId]);
    return result.rows;
};

const addParameter = async (equipmentId, param_name, param_value) => {
    const result = await pool.query(
        `INSERT INTO equipment_parameters (equipment_id, param_name, param_value)
     VALUES ($1, $2, $3) RETURNING *`,
        [equipmentId, param_name, param_value]
    );
    return result.rows[0];
};

module.exports = {
    getAllEquipment,
    getEquipmentById,
    getEquipmentByQr,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getParameters,
    addParameter,
};