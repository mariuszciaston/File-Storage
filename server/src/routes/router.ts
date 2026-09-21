import { Router } from 'express';

import { login, register } from '../controllers/authController.js';
import {
	deleteFile,
	downloadFile,
	getFiles,
	toggleFileStar,
	uploadFile,
} from '../controllers/fileController.js';
import {
	createFolder,
	deleteFolder,
	getFolders,
	toggleFolderStar,
	updateFolder,
} from '../controllers/folderController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { upload, validateFileType } from '../middlewares/upload.js';

const router = Router();

router.post('/auth/register', register);

router.post('/auth/login', login);

router.post('/auth/logout', (req, res) => {
	req.logout((err) => {
		if (err) return res.status(500).json({ error: 'Logout failed' });
		res.json({ message: 'Logged out successfully' });
	});
});

router.get('/auth/me', requireAuth, (req, res) => {
	res.json({ user: req.user });
});

router.get('/dashboard', requireAuth, (req, res) => {
	res.json({ message: 'Dashboard data', user: req.user });
});

router.get('/folders', requireAuth, getFolders);
router.post('/folders', requireAuth, createFolder);
router.patch('/folders/:id/star', requireAuth, toggleFolderStar);
router.patch('/folders/:id', requireAuth, updateFolder);
router.delete('/folders/:id', requireAuth, deleteFolder);

router.get('/files', requireAuth, getFiles);
router.post(
	'/files',
	requireAuth,
	upload.single('file'),
	validateFileType,
	uploadFile,
);
router.get('/files/:id/download', requireAuth, downloadFile);
router.patch('/files/:id/star', requireAuth, toggleFileStar);
router.delete('/files/:id', requireAuth, deleteFile);

export default router;
