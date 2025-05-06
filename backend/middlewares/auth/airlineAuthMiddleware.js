const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Middleware to verify user type is airline
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * 1. Gets the token from the cookie
 * 2. Decodes the token using the JWT Secret
 * 3. Checks if userType is airline
 * 4. Verify the airline still exists (token might have expired during session)
 * 5. if airline is not verified throw an error
 * 6. Attach the user data to the request for the next middleware
 */
module.exports = async (req, res, next) => {
	try {
		// get token from cooke
		const token = req.cookies.token;
		if (!token) {
			throw new Error('No token found!');
		}

		// decode token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			throw new Error('Invalid token');
		}

		// check if its an airline token
		if (decoded.userType !== 'airline') {
			throw new Error('Not authorized as airline');
		}

		// verify if the airline still exists and is verified (because token may exist but flight might be deleted from db)
		const airline = await User.findById(decoded._id);
		if (!airline) {
			throw new Error('Airline not found');
		}

		if (!airline.verificationStatus) {
			throw new Error('Airline not verified');
		}

		// attach the airline data to the request
		req.user = decoded;
		// pass to the response
		next();
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
};
