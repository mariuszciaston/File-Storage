import { NextFunction, Request, Response } from 'express';

import { UserModel } from '../../generated/prisma/models.js';
import { prisma } from '../lib/prisma.js';
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from '../services/cloudinaryService.js';

export const previewFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as UserModel).id;
		const file = await prisma.file.findFirst({
			where: { id, ownerId: userId },
		});
		if (!file) return res.status(404).json({ error: 'File not found' });
		res.redirect(file.secureUrl);
	} catch (error) {
		next(error);
	}
};

export const downloadFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as UserModel).id;
		const file = await prisma.file.findFirst({
			where: { id, ownerId: userId },
		});
		if (!file) return res.status(404).json({ error: 'File not found' });

		const upstream = await fetch(file.secureUrl);

		if (!upstream.ok) {
			return res.status(502).json({ error: 'Could not retrieve file' });
		}

		const buffer = Buffer.from(await upstream.arrayBuffer());

		res.attachment(file.name);
		res.type(file.mimeType);
		res.setHeader('Content-Length', buffer.length);

		res.send(buffer);
	} catch (error) {
		next(error);
	}
};

export const uploadFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

		const userId = (req.user as UserModel).id;
		const { folderId: rawFolderId } = req.body as { folderId?: string };
		const folderId = rawFolderId ? Number(rawFolderId) : null;

		if (folderId) {
			const folder = await prisma.folder.findFirst({
				where: { id: folderId, ownerId: userId },
			});
			if (!folder) {
				return res.status(404).json({ error: 'Folder not found' });
			}
		}

		const { publicId, resourceType, secureUrl } = await uploadToCloudinary(
			req.file.buffer,
			userId,
		);

		const file = await prisma.file.create({
			data: {
				folderId,
				mimeType: req.file.mimetype,
				name: req.file.originalname,
				ownerId: userId,
				publicId,
				resourceType,
				secureUrl,
				size: req.file.size,
			},
		});

		res.status(201).json(file);
	} catch (error) {
		next(error);
	}
};

export const searchItems = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = (req.user as UserModel).id;
		const q = (typeof req.query.q === 'string' ? req.query.q : '').trim();
		if (!q) return res.json({ files: [], folders: [] });

		const [folders, files] = await Promise.all([
			prisma.folder.findMany({
				where: { name: { contains: q, mode: 'insensitive' }, ownerId: userId },
			}),
			prisma.file.findMany({
				where: { name: { contains: q, mode: 'insensitive' }, ownerId: userId },
			}),
		]);
		res.json({ files, folders });
	} catch (error) {
		next(error);
	}
};

export const getFiles = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = (req.user as UserModel).id;
		const folderId = req.query.folderId ? Number(req.query.folderId) : null;

		const files = await prisma.file.findMany({
			where: {
				ownerId: userId,
				...(req.query.starred === 'true' ? { starred: true } : { folderId }),
			},
		});
		res.json(files);
	} catch (error) {
		next(error);
	}
};

export const toggleFileStar = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as UserModel).id;
		const file = await prisma.file.findFirst({
			where: { id, ownerId: userId },
		});
		if (!file) return res.status(404).json({ error: 'File not found' });
		const updated = await prisma.file.update({
			data: { starred: !file.starred },
			where: { id },
		});
		res.json(updated);
	} catch (error) {
		next(error);
	}
};

export const renameFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as UserModel).id;
		const { name } = req.body as { name: string };

		const file = await prisma.file.findFirst({
			where: { id, ownerId: userId },
		});
		if (!file) return res.status(404).json({ error: 'File not found' });

		const updated = await prisma.file.update({
			data: { name },
			where: { id },
		});
		res.json(updated);
	} catch (error) {
		next(error);
	}
};

export const deleteFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as UserModel).id;

		const file = await prisma.file.findFirst({
			where: { id, ownerId: userId },
		});
		if (!file) return res.status(404).json({ error: 'File not found' });

		if (file.publicId.startsWith(`file-storage/${userId}/`)) {
			await deleteFromCloudinary(file, userId);
		}
		await prisma.file.delete({ where: { id } });

		res.json({ message: 'File deleted' });
	} catch (error) {
		next(error);
	}
};

export const moveFile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as UserModel).id;
		const { folderId } = req.body as { folderId: null | number };

		const file = await prisma.file.findFirst({
			where: { id, ownerId: userId },
		});
		if (!file) return res.status(404).json({ error: 'File not found' });

		if (folderId) {
			const folder = await prisma.folder.findFirst({
				where: { id: folderId, ownerId: userId },
			});
			if (!folder)
				return res.status(404).json({ error: 'Target folder not found' });
		}

		const updated = await prisma.file.update({
			data: { folderId: folderId ?? null },
			where: { id },
		});
		res.json(updated);
	} catch (error) {
		next(error);
	}
};
