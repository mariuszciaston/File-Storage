import { Request } from 'express';
import { body } from 'express-validator';

const FORBIDDEN_CHARS = /[<>:"/\\|?*]/;

export const folderNameValidator = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Folder name cannot be empty')
		.isLength({ max: 50 })
		.withMessage('Folder name cannot exceed 50 characters')
		.not()
		.matches(FORBIDDEN_CHARS)
		.withMessage('Folder name contains forbidden characters'),
];

const ALLOWED_MIME_TYPES = new Set([
	'application/msword',
	'application/pdf',
	'application/vnd.ms-excel',
	'application/vnd.ms-powerpoint',
	'application/vnd.oasis.opendocument.presentation',
	'application/vnd.oasis.opendocument.spreadsheet',
	'application/vnd.oasis.opendocument.text',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/xml',
	'image/bmp',
	'image/gif',
	'image/jpeg',
	'image/png',
	'image/svg+xml',
	'image/tiff',
	'image/webp',
	'text/plain',
]);

export const fileUploadValidator = body('file').custom((_value, { req }) => {
	const { file } = req as Request;
	if (!file) {
		throw new Error('File is required');
	}
	if (file.size > 1 * 1024 * 1024) {
		throw new Error('File size exceeds 1 MB limit');
	}

	if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
		throw new Error('File type not allowed');
	}

	return true;
});
