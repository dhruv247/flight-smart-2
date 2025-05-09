import express from 'express';
import { verifyCustomer } from '../middlewares/auth.middlewares.js';
import { createTicket, getTicketById } from '../controllers/ticket.controller.js';

const router = express.Router();

// Customer Routes
router.post('/create-ticket', verifyCustomer, createTicket);

// Common Routes
router.get('/get-ticket-by-id/:id', getTicketById);

export { router };