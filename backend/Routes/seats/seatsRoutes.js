const express = require('express');
const router = express.Router();
// const verifyAirline = require('../../middlewares/auth/airlineAuthMiddleware');
const {
	getSeats
} = require('../../controllers/seats/seatsControllers');

// Get all seats for a flight using flightId
router.get('/getSeats/:id', getSeats);

module.exports = router;