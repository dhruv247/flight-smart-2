import express from 'express';
import {
	getConversation,
	getAirlinesForCustomer,
	getCustomersForAirline,
} from '../controllers/message.controller.js';
import {
	verifyCustomer,
	verifyAirline,
} from '../middlewares/auth.middlewares.js';

const router = express.Router();

// Customer / Airline Routes
router.get('/get-conversation/:userId/:receiverId', getConversation);

// Customer Routes
router.get('/get-airlines-for-customer', verifyCustomer, getAirlinesForCustomer);

// Airline Routes
router.get('/get-customers-for-airline', verifyAirline, getCustomersForAirline);

export { router };