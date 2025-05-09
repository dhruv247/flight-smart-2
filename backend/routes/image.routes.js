import express from 'express';
import { upload } from '../middlewares/image-upload.middlewares.js';
import { uploadImage } from '../controllers/image.controller.js';

const router = express.Router();

// Common Routes
router.post('/upload-image', upload.single('image'), uploadImage);

export { router };