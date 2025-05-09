import express from 'express';
import { verifyAdmin } from '../middlewares/auth.middlewares.js';
import { getAllPlanes, addPlane } from '../controllers/plane.controller.js';

const router = express.Router();

// Admin Routes
router.post('/add-plane', verifyAdmin, addPlane);

// Common Routes
router.get('/get-all-planes', getAllPlanes);

export { router };