const express = require('express');
const router = express.Router();
const {
	getConversation,
	getAirlines,
	getCustomers,
} = require('../../controllers/messages/messagesController');
const verifyCustomer = require('../../middlewares/auth/customerAuthMiddleware');
const verifyAirline = require('../../middlewares/auth/airlineAuthMiddleware');

router.get('/:userId/:receiverId', getConversation);
router.get('/get-airlines', verifyCustomer, getAirlines);
router.get('/get-customers', verifyAirline, getCustomers);

module.exports = router;