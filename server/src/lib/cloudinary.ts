import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_URL) {
	throw new Error('CLOUDINARY_URL is not configured');
}

cloudinary.config(process.env.CLOUDINARY_URL);

export default cloudinary;
