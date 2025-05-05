const express = require('express');
const router = express.Router();
const { profitableEconomyFlights, profitableBusinessFlights, busyDates, flightByDuration } = require('../../controllers/analytics/airlineAnalyticsController');
const verifyAirline = require('../../middlewares/auth/airlineAuthMiddleware');

router.get('/profitable-economy-flights', verifyAirline, profitableEconomyFlights);
router.get('/profitable-business-flights', verifyAirline, profitableBusinessFlights);
router.get('/busy-dates', verifyAirline, busyDates);
router.get('/flights-by-duration', verifyAirline, flightByDuration);

module.exports = router;