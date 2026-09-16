import { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma.js';
import { User } from '../types/types.js';

export const getFolders = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = (req.user as User).id;
		const parentId = req.query.parentId ? Number(req.query.parentId) : null;

		const folders = await prisma.folder.findMany({
			include: { children: true, files: true },
			where: { ownerId: userId, parentId },
		});
		
		res.json(folders);
	} catch (error) {
		next(error);
	}
};

export const createFolder = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { name, parentId } = req.body as { name: string; parentId?: number };
		const userId = (req.user as User).id;

		if (parentId) {
			const parent = await prisma.folder.findFirst({
				where: { id: parentId, ownerId: userId },
			});
			if (!parent)
				return res.status(404).json({ error: 'Parent folder not found' });
		}

		const folder = await prisma.folder.create({
			data: { name, ownerId: userId, parentId: parentId ?? null },
		});

		res.status(201).json(folder);
	} catch (error) {
		next(error);
	}
};

export const updateFolder = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as User).id;
		const { name } = req.body as { name: string };

		const folder = await prisma.folder.findFirst({
			where: { id, ownerId: userId },
		});
		if (!folder) return res.status(404).json({ error: 'Folder not found' });

		const updated = await prisma.folder.update({
			data: { name },
			where: { id },
		});
		res.json(updated);
	} catch (error) {
		next(error);
	}
};

export const deleteFolder = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = Number(req.params.id);
		const userId = (req.user as User).id;

		const folder = await prisma.folder.findFirst({
			where: { id, ownerId: userId },
		});
		if (!folder) return res.status(404).json({ error: 'Folder not found' });

		await prisma.folder.delete({ where: { id } });
		res.json({ message: 'Folder deleted' });
	} catch (error) {
		next(error);
	}
};
