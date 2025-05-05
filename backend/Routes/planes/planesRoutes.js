const express = require('express');
const router = express.Router();
const verifyAdmin = require('../../middlewares/auth/adminAuthMiddleware');
const {
	getAllPlanes,
	create,
} = require('../../controllers/planes/planesController');

// GET all planes
router.get('/get-all', getAllPlanes);

// POST create a new plane
router.post('/create', verifyAdmin, create);

module.exports = router;
