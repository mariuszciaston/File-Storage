import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { prisma } from '../lib/prisma.js';

passport.use(
	new LocalStrategy((username, password, done) => {
		console.log('Login attempt:', { password: password ? '[HIDDEN]' : 'undefined', username });
		prisma.user
			.findUnique({ where: { username } })
			.then((user) => {
				console.log('User found:', user ? 'Yes' : 'No');
				if (!user) {
					done(null, false, { message: 'Incorrect username' });
					return;
				}

				return bcrypt.compare(password, user.password).then((match) => {
					console.log('Password match:', match);
					if (!match) {
						done(null, false, { message: 'Incorrect password' });
						return;
					}
					done(null, user);
				});
			})
			.catch((err) => done(err));
	}),
);

passport.serializeUser((user: Express.User, done) => {
	done(null, (user as { id: number }).id);
});

passport.deserializeUser((id: number, done) => {
	prisma.user
		.findUnique({ where: { id } })
		.then((user) => done(null, user))
		.catch((err) => done(err));
});
