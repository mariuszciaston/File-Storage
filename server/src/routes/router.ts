import { Router } from 'express';

import { login, register } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

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

export default router;
