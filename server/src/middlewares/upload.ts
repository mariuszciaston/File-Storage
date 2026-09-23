import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, 'uploads/');
	},

	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();

		cb(null, `${crypto.randomUUID()}${ext}`);
	},
});

export const upload = multer({
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
	storage,
});

