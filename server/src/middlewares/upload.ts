import { NextFunction, Request, Response } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs/promises';
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
	'image/bmp',
	'image/gif',
	'image/jpeg',
	'image/png',
	'image/svg+xml',
	'image/tiff',
	'image/webp',
	'text/plain',
]);

export async function validateFileType(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (!req.file) return next();

	const buffer = await fs.readFile(req.file.path);
	const detected = await fileTypeFromBuffer(buffer);

	// file-type can't detect plain text or SVG — fall back to mimetype declared by multer
	const mime = detected?.mime ?? req.file.mimetype;

	if (!ALLOWED_MIME_TYPES.has(mime)) {
		await fs.unlink(req.file.path);
		return res.status(400).json({ error: 'File type not allowed' });
	}

	next();
}
