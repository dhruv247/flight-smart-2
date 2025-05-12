import express from 'express';
import { verifyAdmin } from '../middlewares/auth.middlewares.js';
import { addAirport, getAllAirports } from '../controllers/airport.controller.js';

const router = express.Router();

// Admin Routes
router.post('/add-airport', verifyAdmin, addAirport);

// Common Routes
router.get('/get-all-airports', getAllAirports);

export { router };