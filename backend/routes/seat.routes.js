import express from 'express';
import { getSeatsForFlight, getSeatStatus } from '../controllers/seat.controller.js';

const router = express.Router();

// Common Routes
router.get('/get-seats-for-flight/:id', getSeatsForFlight);
router.get('/get-seat-status/:id/:seatNumber', getSeatStatus);

export { router };