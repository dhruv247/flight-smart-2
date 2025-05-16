import express from 'express';
import {
	getMessages,
} from '../controllers/message.controller.js';
import {
	verifyUser
} from '../middlewares/auth.middlewares.js';

const router = express.Router();

// Customer / Airline Routes
router.get('/get-messages/:conversationId', verifyUser, getMessages);

export { router };