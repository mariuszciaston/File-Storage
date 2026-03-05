import bcrypt from 'bcryptjs';

import { prisma } from '../src/lib/prisma';

const pass = process.env.ADMIN_PASSWORD;
if (!pass) throw new Error('ADMIN_PASSWORD is not defined');
const hashedPassword = bcrypt.hashSync(pass, 10);

async function main() {
	const user = await prisma.user.create({
		data: {
			password: hashedPassword,
			username: 'admin',
		},
	});
	console.log('Created user:', user);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
