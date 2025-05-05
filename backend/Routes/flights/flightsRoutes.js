const express = require('express');
const router = express.Router();
const verifyAirline = require('../../middlewares/auth/airlineAuthMiddleware');
const {
	create,
	search,
	updateFlightPrice,
	getFlightById,
	getAllFlightsForAirline,
} = require('../../controllers/flights/flightsController');

router.post('/create', verifyAirline, create); // only airlines can create flights

router.post('/search', search); // searching for flights using aggregation in controller

router.patch('/updateFlightPrice/:id', updateFlightPrice);

router.get('/getFlightById/:id', getFlightById);

router.get('/getAllFlightsForAirline', verifyAirline, getAllFlightsForAirline);

module.exports = router;