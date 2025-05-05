const express = require('express');
const router = express.Router();
const verifyCustomer = require('../../middlewares/auth/customerAuthMiddleware');
const { create, getTicketById } = require('../../controllers/tickets/ticketsController');

router.post('/create', verifyCustomer, create); // only customers can create tickets when booking flights
router.get('/getTicketById/:id', getTicketById);

module.exports = router;