import { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';

import { AuthUser } from '../types/types.js';

// import { validationResult } from 'express-validator';

// export const login = [
// 	(req: Request, res: Response, next: NextFunction) => {
// 		// const errors = validationResult(req);
// 		// if (!errors.isEmpty()) {
// 		// 	res.render('login-form', {
// 		// 		body: req.body as LoginBody,
// 		// 		errors: errors.array(),
// 		// 	});
// 		// 	return;
// 		// }
// 		next();
// 	},
// 	passport.authenticate('local', {
// 		failureRedirect: '/login',
// 		successRedirect: '/',
// 	}),
// ];

export const login = [
	(req: Request, res: Response, next: NextFunction) => {
		(
			passport.authenticate('local', (err: unknown, user: AuthUser | false) => {
				if (err) return next(err);
				if (!user) return res.status(401).json({ error: 'Invalid credentials' });

				res.json({
					message: 'Logged in successfully',
					user: { id: user.id, username: user.username },
				});
			}) as RequestHandler
		)(req, res, next);
	},
];
