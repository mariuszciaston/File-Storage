import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import expressSession from 'express-session';

import { prisma } from '../lib/prisma';

if (!process.env.SESSION_SECRET) {
	throw new Error('SESSION_SECRET is not defined');
}

const sessionMiddleware = expressSession({
	cookie: {
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	},
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	store: new PrismaSessionStore(prisma, {
		checkPeriod: 2 * 60 * 1000, // 2 minutes
		dbRecordIdIsSessionId: true,
	}),
});

export { sessionMiddleware };
