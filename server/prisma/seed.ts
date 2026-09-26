import bcrypt from 'bcryptjs';

import { prisma } from '../src/lib/prisma.js';

const pass = process.env.ADMIN_PASSWORD;
if (!pass) throw new Error('ADMIN_PASSWORD is not defined');
const hashedPassword = bcrypt.hashSync(pass, 10);

async function main() {
	const user = await prisma.user.create({
		data: {
			fullname: 'Guest user',
			password: hashedPassword,
			username: 'guest',
		},
	});
	console.log('Created user:', user);

	const folder1 = await prisma.folder.create({
		data: { name: 'Images', ownerId: user.id, parentId: null },
	});

	console.log('Created folder:', folder1.name);

	const folder2 = await prisma.folder.create({
		data: { name: 'Documents', ownerId: user.id, parentId: null },
	});

	console.log('Created folder:', folder2.name);
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
