const pool = require('../config/db');

const findUserByUsername = async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
};

const createUser = async (username, password_hash, full_name, role) => {
    const result = await pool.query(
        `INSERT INTO users (username, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role`,
        [username, password_hash, full_name, role]
    );
    return result.rows[0];
};

const getUserById = async (id) => {
    const result = await pool.query('SELECT id, username, full_name, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

module.exports = { findUserByUsername, createUser, getUserById };