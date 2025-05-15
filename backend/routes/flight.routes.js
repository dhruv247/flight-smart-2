import express from 'express';
import { verifyAirline } from '../middlewares/auth.middlewares.js';
import {
	createFlight,
	searchFlights,
	updateFlightPrice,
	getFlightById,
	getAllFlightsForAirline,
	searchFlightsForAirline,
} from '../controllers/flight.controller.js';

const router = express.Router();

// Airline Routes
router.post('/create-flight', verifyAirline, createFlight);
router.get('/get-all-flights-for-airline', verifyAirline, getAllFlightsForAirline);
router.get('/search-flights-for-airline', verifyAirline, searchFlightsForAirline);

// Common Routes
router.post('/search-flights', searchFlights);
router.patch('/update-flight-price/:id', updateFlightPrice);
router.get('/get-flight-by-id/:id', getFlightById);

export { router };