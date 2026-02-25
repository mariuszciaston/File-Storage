import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { prisma } from '../lib/prisma';

passport.use(
	new LocalStrategy((username, password, done) => {
		prisma.user
			.findUnique({ where: { username } })
			.then((user) => {
				if (!user) {
					done(null, false, { message: 'Incorrect username' });
					return;
				}
				return bcrypt.compare(password, user.password).then((match) => {
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
