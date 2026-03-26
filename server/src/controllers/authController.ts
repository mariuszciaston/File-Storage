import bcrypt from 'bcryptjs';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';

import { prisma } from '../lib/prisma.js';
import { User } from '../types/types.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { fullname, password, passwordConfirmation, username } = req.body as User;

		if (password !== passwordConfirmation) {
			return res.status(400).json({ error: 'Passwords do not match' });
		}

		const existingUser = await prisma.user.findUnique({ where: { username } });
		if (existingUser) {
			return res.status(400).json({ error: 'Username already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { fullname, password: hashedPassword, username },
		});

		req.logIn(user, (err) => {
			if (err) return next(err);
			res.json({
				message: 'Account created successfully',
				user: { id: user.id, username: user.username },
			});
		});
	} catch (error) {
		next(error);
	}
};

export const login = [
	(req: Request, res: Response, next: NextFunction) => {
		(
			passport.authenticate('local', (err: unknown, user: false | User) => {
				if (err) return next(err);
				if (!user) return res.status(401).json({ error: 'Invalid credentials' });

				req.logIn(user, (err) => {
					if (err) return next(err);
					res.json({
						message: 'Logged in successfully',
						user: {
							fullname: user.fullname,
							id: user.id,
							username: user.username,
						},
					});
				});
			}) as RequestHandler
		)(req, res, next);
	},
];
