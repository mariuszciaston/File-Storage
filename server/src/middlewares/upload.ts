import multer from 'multer';

export const upload = multer({
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
	storage: multer.memoryStorage(),
});
