const express = require('express');
const router = express.Router();
const {
	register,
	login,
	logout,
	getMe,
	updatePassword,
	updateProfilePicture,
} = require('../../controllers/auth/airlineAuthController');
const requireAuth = require('../../middlewares/auth/airlineAuthMiddleware');

router.post('/register', register); // route for airline to register
router.post('/login', login); // route for airline to login
router.post('/logout', logout); // route for airline to logout
router.get('/me', requireAuth, getMe); // using middleware for checking user is airline
router.patch('/update-password', requireAuth, updatePassword); // route for airline to update password
router.patch('/update-profile-picture', requireAuth, updateProfilePicture); // route for airline to update profile picture

module.exports = router;
