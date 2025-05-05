// This file contains all the routes required by the admin to verify airlines who have registered

const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../middlewares/auth/adminAuthMiddleware');
const {
	verifyAirline,
	generateAirlinePassword,
	deleteAirline,
	getAllAirlines,
} = require('../../controllers/auth/adminAirlineVerificationController');

// route to verify an airline (admin only)
router.post('/verify', verifyAdmin, verifyAirline);

// Route to generate password for verified airline (admin only)
router.post('/generate-password', verifyAdmin, generateAirlinePassword);

router.post('/delete', verifyAdmin, deleteAirline); // route to delete airline (admin only)

router.get('/get-all', verifyAdmin, getAllAirlines); // route to get all airlines

module.exports = router;