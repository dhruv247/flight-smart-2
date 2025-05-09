import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

/**
 * Verifies that current user type is admin
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
		
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ message: 'No token found!' });
		}
		
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ message: 'Invalid token' });
		}
		
		if (decoded.userType !== 'admin') {
			return res.status(403).json({ message: 'Not authorized. Admin access required.' });
		}

		const user = await User.findById(decoded._id);
		if (!user) {
			return res.status(404).json({ message: 'Admin user not found' });
		}

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
};

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
const verifyAirline = async (req, res, next) => {
	try {
		
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ message: 'No token found!' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ message: 'Invalid token' });
		}

		if (decoded.userType !== 'airline') {
			return res.status(403).json({ message: 'Not authorized as airline' });
		}

		const airline = await User.findById(decoded._id);
		if (!airline) {
			return res.status(404).json({ message: 'Airline not found' });
		}

		if (!airline.verificationStatus) {
			return res.status(400).json({ message: 'Airline not verified' });
		}

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
};

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
const verifyCustomer = async (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ message: 'No token found!' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ message: 'Invalid token' });
		}

		if (decoded.userType !== 'customer') {
			return res.status(403).json({ message: 'Not authorized as customer' });
		}

		const customer = await User.findById(decoded._id);
		if (!customer) {
			return res.status(404).json({ message: 'Customer not found' });
		}

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
};

/**
 * Middleware to verify a user is logged in
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description
 * 1. Gets the token from the cookie
 * 2. Decodes the token using the JWT Secret
 * 3. Verify the user still exists (token might have expired during session)
 * 4. Attach the user data to the request for the next middleware
 */
const verifyUser = async (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ message: 'No token found!' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({ message: 'Invalid token' });
		}

		const user = await User.findById(decoded._id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		req.user = decoded;
		next();
		
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
};

export { verifyAdmin, verifyAirline, verifyCustomer, verifyUser };