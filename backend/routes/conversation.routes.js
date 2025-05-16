import express from 'express';
import {
  verifyCustomer,
  verifyAirline
} from '../middlewares/auth.middlewares.js';
import { startConversation, getConversationsForCustomer, getConversationsForAirline } from '../controllers/conversation.controller.js';

const router = express.Router();

// Customer / Airline Routes
router.post('/start-conversation', verifyCustomer, startConversation);
router.get('/get-conversations-for-customer', verifyCustomer, getConversationsForCustomer);
router.get('/get-conversations-for-airline', verifyAirline, getConversationsForAirline);

export { router };