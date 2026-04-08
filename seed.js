const bcrypt = require('bcryptjs');
const { createUser } = require('./src/models/userModel');
require('dotenv').config();

async function seed() {
    const hash = await bcrypt.hash('admin123', 10);
    const user = await createUser('admin', hash, 'Администратор', 'admin');
    console.log('Создан пользователь:', user);
}

seed().catch(console.error);