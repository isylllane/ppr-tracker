const multer = require('multer');
const path = require('path');
const { addAttachment } = require('../models/attachmentModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Нет загруженных файлов' });
        const { ppr_history_id, repair_log_id } = req.body;
        const filePath = `/uploads/${req.file.filename}`;
        const attachment = await addAttachment(
            ppr_history_id || null,
            repair_log_id || null,
            req.file.originalname,
            filePath,
            req.file.size,
            req.file.mimetype,
            req.user.id
        );
        res.status(201).json(attachment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { upload, uploadFile };