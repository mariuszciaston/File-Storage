import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

import { UserModel } from '../../generated/prisma/models.js';
import { prisma } from '../lib/prisma.js';

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
		res.sendFile(path.resolve(file.url));
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
		res.download(path.resolve(file.url), file.name);
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
				await fs.unlink(req.file.path);
				return res.status(404).json({ error: 'Folder not found' });
			}
		}

		const file = await prisma.file.create({
			data: {
				folderId,
				name: req.file.originalname,
				ownerId: userId,
				size: req.file.size,
				url: req.file.path,
			},
		});

		res.status(201).json(file);
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
			where: { folderId, ownerId: userId },
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

		await fs.unlink(file.url).catch(() => null);
		await prisma.file.delete({ where: { id } });

		res.json({ message: 'File deleted' });
	} catch (error) {
		next(error);
	}
};
