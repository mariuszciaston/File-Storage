import bcrypt from 'bcryptjs';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';

import { UserModel } from '../../generated/prisma/models.js';
import { prisma } from '../lib/prisma.js';

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { fullname, password, username } = req.body as Pick<
			UserModel,
			'fullname' | 'password' | 'username'
		> & {
			passwordConfirmation: string;
		};

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
			passport.authenticate(
				'local',
				(err: unknown, user: false | UserModel) => {
					if (err) return next(err);
					if (!user)
						return res.status(401).json({ error: 'Invalid credentials' });

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
				},
			) as RequestHandler
		)(req, res, next);
	},
];

export const logout = (req: Request, res: Response) => {
	req.logout((err) => {
		if (err) return res.status(500).json({ error: 'Logout failed' });
		res.json({ message: 'Logged out successfully' });
	});
};
