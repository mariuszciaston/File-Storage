import { Request } from 'express';
import { body } from 'express-validator';

import { prisma } from '../lib/prisma.js';

const FORBIDDEN_CHARS = /[<>:"/\\|?*]/;

export const validateRegister = [
	body('fullname')
		.trim()
		.isAlpha('pl-PL', { ignore: ' ' })
		.withMessage('Full name must only contain letters')
		.isLength({ max: 20, min: 1 })
		.withMessage('Full name must be between 1 and 20 characters'),
	body('username')
		.trim()
		.isAlphanumeric()
		.withMessage('Username must only contain letters and numbers')
		.isLength({ max: 15, min: 3 })
		.withMessage('Username must be between 3 and 15 characters')
		.bail()
		.custom(async (username: string) => {
			const existingUser = await prisma.user.findUnique({
				where: { username },
			});
			if (existingUser) {
				throw new Error('Username already exists');
			}
			return true;
		}),
	body('password')
		.isLength({ max: 20, min: 8 })
		.withMessage('Password must be between 8 and 20 characters')
		.matches(/[a-z]/)
		.withMessage('Password must contain at least one lowercase letter')
		.matches(/[A-Z]/)
		.withMessage('Password must contain at least one uppercase letter')
		.matches(/[0-9]/)
		.withMessage('Password must contain at least one number')
		.matches(/[@$!%*?&]/)
		.withMessage(
			'Password must contain at least one special character (@, $, !, %, *, ?, &)',
		),
	body('passwordConfirmation')
		.notEmpty()
		.withMessage('Password confirmation is required')
		.custom((passwordConfirmation, { req }) => {
			const { password } = req.body as { password: string };
			if (passwordConfirmation !== password) {
				throw new Error('Password confirmation does not match password');
			}
			return true;
		}),
];

export const validateLogin = [
	body('username').notEmpty().withMessage('Username is required'),
	body('password').notEmpty().withMessage('Password is required'),
];

export const validateName = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Name cannot be empty')
		.isLength({ max: 50 })
		.withMessage('Name cannot exceed 50 characters')
		.not()
		.matches(FORBIDDEN_CHARS)
		.withMessage('Name contains forbidden characters'),
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

export const validateFileUpload = body('file').custom((_value, { req }) => {
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
