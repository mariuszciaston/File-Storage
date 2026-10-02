import 'dotenv/config';
import bcrypt from 'bcryptjs';

import cloudinary from '../src/lib/cloudinary.js';
import { prisma } from '../src/lib/prisma.js';

const pass = process.env.ADMIN_PASSWORD;
if (!pass) throw new Error('ADMIN_PASSWORD is not defined');
const hashedPassword = bcrypt.hashSync(pass, 10);

interface CloudinaryAsset {
	bytes: number;
	display_name?: string;
	format: string;
	original_filename?: string;
	public_id: string;
	resource_type: 'image' | 'raw' | 'video';
	secure_url: string;
}

interface CloudinaryFolder {
	name: string;
	path: string;
}

const pageSize = 500;

function getAssetName(asset: CloudinaryAsset) {
	const baseName =
		asset.display_name ??
		asset.original_filename ??
		asset.public_id.split('/').at(-1) ??
		asset.public_id;
	return /\.[^./]+$/.test(baseName) ? baseName : `${baseName}.${asset.format}`;
}

async function getCloudinaryAssets(folderPath: string) {
	const assets: CloudinaryAsset[] = [];
	let nextCursor: string | undefined;

	do {
		const response = await cloudinary.api.resources_by_asset_folder(
			folderPath,
			{
				max_results: pageSize,
				...(nextCursor ? { next_cursor: nextCursor } : {}),
			},
		);
		assets.push(...(response.resources as CloudinaryAsset[]));
		nextCursor = response.next_cursor;
	} while (nextCursor);

	return assets;
}

async function getCloudinarySubfolders(folderPath: string) {
	const folders: CloudinaryFolder[] = [];
	let nextCursor: string | undefined;

	do {
		const response = (await cloudinary.api.sub_folders(folderPath, {
			max_results: pageSize,
			...(nextCursor ? { next_cursor: nextCursor } : {}),
		})) as { folders: CloudinaryFolder[]; next_cursor?: string };
		folders.push(...response.folders);
		nextCursor = response.next_cursor;
	} while (nextCursor);

	return folders;
}
function getMimeType(asset: CloudinaryAsset) {
	const format = asset.format.toLowerCase();
	if (asset.resource_type === 'image') {
		return `image/${format === 'jpg' ? 'jpeg' : format === 'svg' ? 'svg+xml' : format}`;
	}
	if (asset.resource_type === 'video') return `video/${format}`;

	const rawMimeTypes: Record<string, string> = {
		csv: 'text/csv',
		doc: 'application/msword',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		pdf: 'application/pdf',
		ppt: 'application/vnd.ms-powerpoint',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		txt: 'text/plain',
		xls: 'application/vnd.ms-excel',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	};
	return rawMimeTypes[format] ?? 'application/octet-stream';
}

async function main() {
	const user = await prisma.user.upsert({
		create: {
			fullname: 'Guest user',
			password: hashedPassword,
			username: 'guest',
		},
		update: { fullname: 'Guest user', password: hashedPassword },
		where: { username: 'guest' },
	});
	console.log('Seeded user:', user.username);
	await prisma.$transaction([
		prisma.file.deleteMany({ where: { ownerId: user.id } }),
		prisma.folder.deleteMany({ where: { ownerId: user.id } }),
	]);
	console.log('Removed existing guest files and folders from the database.');

	// for (const name of ['Images', 'Documents']) {
	// 	const existingFolder = await prisma.folder.findFirst({
	// 		where: { name, ownerId: user.id, parentId: null },
	// 	});
	// 	if (!existingFolder)
	// 		await prisma.folder.create({
	// 			data: { name, ownerId: user.id, parentId: null },
	// 		});
	// }

	await seedCloudinaryFolder(user.id, 'samples', null, 'samples');
	console.log('Seeded Cloudinary samples under the samples folder.');
}

async function seedCloudinaryFolder(
	ownerId: number,
	folderPath: string,
	parentId: null | number,
	name: string,
) {
	const existingFolder = await prisma.folder.findFirst({
		where: { name, ownerId, parentId },
	});
	const folder =
		existingFolder ??
		(await prisma.folder.create({ data: { name, ownerId, parentId } }));

	for (const asset of await getCloudinaryAssets(folderPath)) {
		const fileData = {
			folderId: folder.id,
			mimeType: getMimeType(asset),
			name: getAssetName(asset),
			ownerId,
			publicId: asset.public_id,
			resourceType: asset.resource_type,
			secureUrl: asset.secure_url,
			size: asset.bytes,
		};
		const existingFile = await prisma.file.findFirst({
			where: { ownerId, publicId: asset.public_id },
		});

		if (existingFile) {
			await prisma.file.update({
				data: fileData,
				where: { id: existingFile.id },
			});
		} else {
			await prisma.file.create({ data: fileData });
		}
	}

	for (const subfolder of await getCloudinarySubfolders(folderPath)) {
		await seedCloudinaryFolder(
			ownerId,
			subfolder.path,
			folder.id,
			subfolder.name,
		);
	}
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
