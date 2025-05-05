const express = require('express');
const router = express.Router();
const verifyCustomer = require('../../middlewares/auth/customerAuthMiddleware');
const { create, getBookings, cancelBooking } = require('../../controllers/bookings/bookingsController');

router.post('/create', verifyCustomer, create); // only customers can create bookings

router.get('/getBookings', verifyCustomer, getBookings); // Only customer can get booking

router.patch('/cancelBooking/:id', verifyCustomer, cancelBooking);

module.exports = router;