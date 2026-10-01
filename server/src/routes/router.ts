import { Router } from 'express';

import { login, logout, register } from '../controllers/authController.js';
import {
	deleteFile,
	downloadFile,
	getFiles,
	moveFile,
	previewFile,
	renameFile,
	searchItems,
	toggleFileStar,
	uploadFile,
} from '../controllers/fileController.js';
import {
	createFolder,
	deleteFolder,
	downloadFolder,
	getFolders,
	moveFolder,
	renameFolder,
	toggleFolderStar,
} from '../controllers/folderController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { upload } from '../middlewares/upload.js';
import { validation } from '../middlewares/validation.js';
import {
	validateFileUpload,
	validateLogin,
	validateName,
	validateRegister,
} from '../middlewares/validators.js';

const router = Router();

router.post('/auth/register', validateRegister, validation, register);

router.post('/auth/login', validateLogin, validation, login);

router.post('/auth/logout', logout);

router.get('/auth/me', requireAuth, (req, res) => {
	res.json({ user: req.user });
});

router.get('/dashboard', requireAuth, (req, res) => {
	res.json({ message: 'Dashboard data', user: req.user });
});

router.get('/folders', requireAuth, getFolders);
router.post('/folders', requireAuth, validateName, validation, createFolder);
router.patch('/folders/:id/star', requireAuth, toggleFolderStar);
router.patch('/folders/:id/move', requireAuth, moveFolder);
router.patch(
	'/folders/:id',
	requireAuth,
	validateName,
	validation,
	renameFolder,
);
router.get('/folders/:id/download', requireAuth, downloadFolder);
router.delete('/folders/:id', requireAuth, deleteFolder);

router.get('/search', requireAuth, searchItems);

router.get('/files', requireAuth, getFiles);
router.post(
	'/files',
	requireAuth,
	upload.single('file'),
	validateFileUpload,
	validation,
	uploadFile,
);
router.get('/files/:id/preview', requireAuth, previewFile);
router.get('/files/:id/download', requireAuth, downloadFile);
router.patch('/files/:id/star', requireAuth, toggleFileStar);
router.patch('/files/:id/move', requireAuth, moveFile);
router.patch('/files/:id', requireAuth, validateName, validation, renameFile);
router.delete('/files/:id', requireAuth, deleteFile);

export default router;
