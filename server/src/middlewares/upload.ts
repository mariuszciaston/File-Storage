import multer from 'multer';

import cloudinary from '../lib/cloudinary.js';

export const upload = multer({
	limits: {
		fileSize: 1 * 1024 * 1024, // 1 MB
	},
	storage: multer.memoryStorage(),
});

export const uploadToCloudinary = (
	buffer: Buffer,
	userId: number,
): Promise<string> =>
	new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: `file-storage/${userId}`,
					resource_type: 'auto',
				},
				(error, result) => {
					if (error || !result) {
						reject(new Error(error?.message ?? 'Cloudinary upload failed'));
						return;
					}

					resolve(result.secure_url);
				},
			)
			.end(buffer);
	});
