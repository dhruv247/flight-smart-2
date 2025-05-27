import express from 'express';
import {
  verifyUser,
  verifyCustomer,
} from '../middlewares/auth.middlewares.js';
import { startConversation, getConversations } from '../controllers/conversation.controller.js';

const router = express.Router();

// Customer / Airline Routes
router.post('/start-conversation', verifyCustomer, startConversation);
router.get('/get-conversations', verifyUser, getConversations);

export { router };