const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Verifies that current userType is customer
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @description
 * 1. Gets the token from the cookie
 * 2. Decodes the token using the JWT Secret
 * 3. Checks if userType is customer
 * 4. Verify the customer still exists (token might have expired during session)
 * 5. Attach the user data to the request for the next middleware
 */
module.exports = async (req, res, next) => {
	try {
		// get token from cookie
		const token = req.cookies.token;
		if (!token) {
			throw new Error('No token found!');
		}

		// decode token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			throw new Error('Invalid token');
		}

		// check if it's a customer token
		if (decoded.userType !== 'customer') {
			throw new Error('Not authorized as customer');
		}

		// verify if the customer still exists (same reason as other middlewares)
		const customer = await User.findById(decoded._id);
		if (!customer) {
			throw new Error('Customer not found');
		}

		// attach the customer data to the request
		req.user = decoded;
		// pass to the next middleware
		next();
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
};