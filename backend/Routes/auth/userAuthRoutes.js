const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, updatePassword, updateProfilePicture } = require("../../controllers/auth/userAuthController");
const requireAuth = require("../../middlewares/auth/userAuthMiddleware");

router.post("/register", register); // route to register a user
router.post("/login", login); // login a user
router.post('/logout', requireAuth, logout); // logout a user
router.get("/me", requireAuth, getMe);
router.patch("/update-password", requireAuth, updatePassword);
router.patch("/update-profile-picture", requireAuth, updateProfilePicture);

module.exports = router;