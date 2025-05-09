import express from 'express';
import {
	topDepartureFlightsByNumberOfTickets,
	topAirlinesByNumberOfFlights,
	topCitiesByNumberOfFlights,
	topPlanesByNumberOfFlights,
	profitableEconomyFlights,
	profitableBusinessFlights,
	topDatesByNumberOfFlights,
	flightByDuration,
	topDestinations,
} from '../controllers/analytics.controller.js';
import { verifyAirline, verifyAdmin } from '../middlewares/auth.middlewares.js';

const router = express.Router();

// Admin Analytics Routes
router.get(
	'/top-departure-flights-by-number-of-tickets',
	verifyAdmin,
	topDepartureFlightsByNumberOfTickets
);
router.get(
	'/top-airlines-by-number-of-flights',
	verifyAdmin,
	topAirlinesByNumberOfFlights
);
router.get(
	'/top-cities-by-number-of-flights',
	verifyAdmin,
	topCitiesByNumberOfFlights
);
router.get(
	'/top-planes-by-number-of-flights',
	verifyAdmin,
	topPlanesByNumberOfFlights
);

// Airline Analytics Routes
router.get(
	'/profitable-economy-flights',
	verifyAirline,
	profitableEconomyFlights
);
router.get(
	'/profitable-business-flights',
	verifyAirline,
	profitableBusinessFlights
);
router.get(
	'/top-dates-by-number-of-flights',
	verifyAirline,
	topDatesByNumberOfFlights
);
router.get('/flights-by-duration', verifyAirline, flightByDuration);

// Customer Analytics Routes (not protected as data is not sensitive)
router.get('/top-destinations', topDestinations);

export { router };