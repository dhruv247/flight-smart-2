const express = require('express');
const router = express.Router();

const {
	flights,
	topAirlines,
	topCities,
	topPlanes,
} = require('../../controllers/analytics/adminAnalyticsController');

const verifyAdmin = require('../../middlewares/auth/adminAuthMiddleware');

router.get('/flights', flights);
router.get('/top-airlines', verifyAdmin, topAirlines);
router.get('/top-cities', verifyAdmin, topCities);
router.get('/top-planes', verifyAdmin, topPlanes);

module.exports = router;
