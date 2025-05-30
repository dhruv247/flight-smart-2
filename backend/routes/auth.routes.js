import express from 'express';
import {
	register,
	login,
	logout,
	getMe,
	verifyAirline,
	deleteAirline,
	getAllAirlines,
} from '../controllers/auth.controller.js';
import { verifyUser, verifyAdmin } from '../middlewares/auth.middlewares.js';

const router = express.Router();

// Common Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyUser, logout);
router.get('/me', verifyUser, getMe);

// Admin Routes (For verifying and blocking airlines)
router.post('/verify-airline', verifyAdmin, verifyAirline);
router.post('/delete-airline', verifyAdmin, deleteAirline);
router.get('/get-all-airlines', verifyAdmin, getAllAirlines);

export { router };