const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../middlewares/auth/adminAuthMiddleware');
const {
	cityNameValidation,
} = require('../../validators/cities/citiesValidator');
const { create, getAll } = require('../../controllers/cities/citiesControllers');

router.post('/create', verifyAdmin, cityNameValidation, create); // rote to create a city
router.get("/getAll", getAll) // Route to get all cities

module.exports = router;