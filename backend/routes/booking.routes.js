import express from 'express';
import { verifyCustomer } from '../middlewares/auth.middlewares.js';
import {
	createBooking,
	getBookingsForCustomer,
	cancelBooking,
} from '../controllers/booking.controller.js';

const router = express.Router();

// Customer Routes
router.post('/create-booking', verifyCustomer, createBooking);
router.get('/get-bookings-for-customer', verifyCustomer, getBookingsForCustomer);
router.patch('/cancel-booking/:id', verifyCustomer, cancelBooking);

export { router };