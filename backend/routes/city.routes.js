import express from 'express';
import { verifyAdmin } from '../middlewares/auth.middlewares.js';
import { cityNameValidation } from '../validators/citiesValidator.js';
import { addCity, getAllCities } from '../controllers/city.controller.js';

const router = express.Router();

// Admin Routes
router.post('/add-city', verifyAdmin, cityNameValidation, addCity);

// Common Routes
router.get('/get-all-cities', getAllCities);

export { router };