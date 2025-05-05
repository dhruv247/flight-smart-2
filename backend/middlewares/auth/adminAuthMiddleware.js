// this middleware is used to verify that the current user is an admin

const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Verifies that current user is admin
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @description
 * 1. Gets the token from the cookie
 * 2. Decodes the token using the JWT Secret
 * 3. Checks if userType is admin
 * 4. Verify the admin still exists (token might have expired during session)
 * 5. Attach the user data to the request for the next middleware
 */
const verifyAdmin = async (req, res, next) => {
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

		// check if its an admin token
		if (decoded.userType !== 'admin') {
			throw new Error('Not authorized. Admin access required.');
		}

		// erify if the admin still exists
		const user = await User.findById(decoded._id);
		if (!user) {
			throw new Error('Admin user not found');
		}

		// attach the user data to the request
		req.user = decoded;
		// pass to the response
		next();
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
};

module.exports = verifyAdmin;
