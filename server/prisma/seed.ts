import { prisma } from '../src/lib/prisma';

async function main() {
	const user = await prisma.user.create({
		data: {
			password: 'admin123',
			username: 'Admin',
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
