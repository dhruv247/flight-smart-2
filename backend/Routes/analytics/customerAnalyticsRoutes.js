const express = require('express');
const router = express.Router();

const {
	popularDestinations,
} = require('../../controllers/analytics/customerAnalyticsController');

router.get('/popularDestinations', popularDestinations); // no verifyCustomer middleware because this is public route (non sensitive data)

module.exports = router;
