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
	fileFilter: (_req, file, cb) => {
		const allowed = ['image/png', 'image/jpeg', 'text/plain'];

		cb(null, allowed.includes(file.mimetype));
	},
	storage,
});

export default upload;
