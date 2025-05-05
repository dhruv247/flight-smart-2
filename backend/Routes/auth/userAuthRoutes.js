const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, updatePassword } = require("../../controllers/auth/userAuthController");
const requireAuth = require("../../middlewares/auth/userAuthMiddleware");

router.post("/register", register); // route to register a user
router.post("/login", login); // login a user
router.post('/logout', requireAuth, logout); // logout a user
router.get("/me", requireAuth, getMe); // Added an authentication (using middleware) which ensures that getting user is only possible if user type is "admin" or "customer"
router.patch("/update-password", requireAuth, updatePassword);

module.exports = router;