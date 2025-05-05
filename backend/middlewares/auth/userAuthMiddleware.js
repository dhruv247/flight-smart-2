const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Middleware to verify user type is admin or customer
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @description
 * 1. Gets the token from the cookie
 * 2. Decodes the token using the JWT Secret
 * 3. Checks if userType is admin or customer
 * 4. Verify the user still exists (token might have expired during session)
 * 5. Attach the user data to the request for the next middleware
 */
module.exports = async (req, res, next) => {
	try {
		// get the token from the cookie
		const token = req.cookies.token;
		if (!token) {
			throw new Error('No token found!');
		}

		// get decoded token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			throw new Error('Invalid token');
		}

		// check if its a user token
		if (!['admin', 'customer'].includes(decoded.userType)) {
			throw new Error('Not authorized');
		}

		// verify if the user still exists (this is necessary because user may be deleted from db and the token still exists in the browser)
		const user = await User.findById(decoded._id);
		if (!user) {
			throw new Error('User not found');
		}

		// attach the user data to the request
		req.user = decoded;
		// pass to the response
		next();
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
};
