import express from 'express';
import { verifyAirline, verifyCustomer } from '../middlewares/auth.middlewares.js';
import {
	createBooking,
	searchBookingsForAirlines,
	cancelBooking,
	searchBookingsForCustomer,
	getAllBookingsForCustomer
} from '../controllers/booking.controller.js';

const router = express.Router();

// Customer Routes
router.post(
	'/create-booking',
	verifyCustomer,
	createBooking
);
router.patch(
	'/cancel-booking/:id',
	verifyCustomer,
	cancelBooking
);
router.get(
	'/search-bookings-for-customer',
	verifyCustomer,
	searchBookingsForCustomer
);
router.get(
	'/get-all-bookings-for-customer',
	verifyCustomer,
	getAllBookingsForCustomer
);

// Airline Routes
router.get(
	'/search-bookings-for-airline',
	verifyAirline,
	searchBookingsForAirlines
)

export { router };
