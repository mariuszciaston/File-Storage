import { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';

import { AuthUser } from '../types/types.js';

export const login = [
	(req: Request, res: Response, next: NextFunction) => {
		(
			passport.authenticate('local', (err: unknown, user: AuthUser | false) => {
				if (err) return next(err);
				if (!user) return res.status(401).json({ error: 'Invalid credentials' });

				req.logIn(user, (err) => {
					if (err) return next(err);
					res.json({
						message: 'Logged in successfully',
						user: { id: user.id, username: user.username },
					});
				});
			}) as RequestHandler
		)(req, res, next);
	},
];
