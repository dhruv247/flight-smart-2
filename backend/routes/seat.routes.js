import express from 'express';
import { getSeatsForFlight } from '../controllers/seat.controller.js';

const router = express.Router();

// Common Routes
router.get('/get-seats-for-flight/:id', getSeatsForFlight);

export { router };