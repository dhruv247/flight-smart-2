import express from 'express';
import {
  verifyAdmin
} from '../middlewares/auth.middlewares.js';
import { createDiscount, getDiscounts } from '../controllers/discount.controller.js';

const router = express.Router();

// Customer / Airline Routes
router.post('/create-discount', verifyAdmin, createDiscount);
router.get('/get-discounts', getDiscounts);

export { router };