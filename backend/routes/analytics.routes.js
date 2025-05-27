import express from 'express';
import {
	topDepartureTimes,
	topAirlinesByNumberOfFlights,
	topCitiesByNumberOfFlights,
	topPlanesByNumberOfFlights,
	profitableEconomyFlights,
	profitableBusinessFlights,
	topDatesByNumberOfFlights,
	flightByDuration,
	topDestinations,
	topRoutesByNumberOfFlights,
	topTravelClass,
	topEconomyOccupancyFlights,
	topBusinessOccupancyFlights,
	mostExpensiveBusinessClassFlights,
	cheapestEconomyClassFlights,
} from '../controllers/analytics.controller.js';
import { verifyAirline, verifyAdmin } from '../middlewares/auth.middlewares.js';

const router = express.Router();

// Admin Analytics Routes
router.get('/top-departure-times', verifyAdmin, topDepartureTimes);
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
router.get(
	'/top-routes-by-number-of-flights',
	verifyAdmin,
	topRoutesByNumberOfFlights
);
router.get(
	'/top-travel-class',
	verifyAdmin,
	topTravelClass
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
router.get(
	'/top-economy-occupancy-flights',
	verifyAirline,
	topEconomyOccupancyFlights
);
router.get(
	'/top-business-occupancy-flights',
	verifyAirline,
	topBusinessOccupancyFlights
);
router.get(
	'/cheapest-economy-class-flights',
	verifyAirline,
	cheapestEconomyClassFlights
);
router.get(
	'/most-expensive-business-class-flights',
	verifyAirline,
	mostExpensiveBusinessClassFlights
);

// Customer Analytics Routes (not protected as data is not sensitive)
router.get('/top-destinations', topDestinations);

export { router };
