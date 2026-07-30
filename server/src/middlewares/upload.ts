import multer from 'multer';

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, 'uploads/');
	},

	filename: (_req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
	storage,
});

export default upload;
