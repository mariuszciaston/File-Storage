import type { FileModel } from '../../generated/prisma/models.js';

import cloudinary from '../lib/cloudinary.js';

type CloudinaryFileMetadata = Pick<
	FileModel,
	'publicId' | 'resourceType' | 'secureUrl'
>;

export const uploadToCloudinary = (
	buffer: Buffer,
	ownerId: FileModel['ownerId'],
): Promise<CloudinaryFileMetadata> =>
	new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: `file-storage/${ownerId}`,
					resource_type: 'auto',
				},
				(error, result) => {
					if (error || !result) {
						reject(new Error(error?.message ?? 'Cloudinary upload failed'));
						return;
					}
					resolve({
						publicId: result.public_id,
						resourceType: result.resource_type as FileModel['resourceType'],
						secureUrl: result.secure_url,
					});
				},
			)
			.end(buffer);
	});

export const deleteFromCloudinary = async (
	file: CloudinaryFileMetadata,
	ownerId: FileModel['ownerId'],
): Promise<void> => {
	const ownerFolder = `file-storage/${ownerId}/`;

	if (!file.publicId.startsWith(ownerFolder)) {
		throw new Error('Cloudinary file does not belong to this user');
	}

	const result = (await cloudinary.uploader.destroy(file.publicId, {
		invalidate: true,
		resource_type: file.resourceType,
	})) as { result: string };

	if (result.result !== 'ok' && result.result !== 'not found') {
		throw new Error(`Cloudinary deletion failed: ${result.result}`);
	}
};
