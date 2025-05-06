const Airline = require('../../models/Airline');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Utility function create a jwt
 * @param {*} airline
 * @description
 * 1. Creates a jwt token for the airline
 * 2. Expires in 1 hour
 * 3. Returns the token
 */
const createToken = (airline) => {
	return jwt.sign(
		{ _id: airline._id, userType: airline.userType },
		process.env.JWT_SECRET,
		{ expiresIn: '2h' }
	);
};

/**
 * Register a new airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Gets the airline details from the body
 * 2. Checks for mandatory fields
 * 3. Performs validation checks
 * 4. Ensures that password is not being set
 * 5. Checks usertype
 * 6. checks for duplicates in db
 * 7. create's new airlines
 */
exports.register = async (req, res) => {
	try {
		// Destructure the object
		const { airlineName, email, password, verificationStatus, userType } =
			req.body;

		// Backend check for mandatory fields
		if (!airlineName || !email) {
			throw new Error(
				'Please fill in all mandatory fields: airlineName, email'
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error('Please provide a valid email address');
		}

		// Validate airline name format
		const nameRegex = /^[A-Z][a-z]*(?:\s[A-Z][a-z]*)*$/;
		if (!nameRegex.test(airlineName)) {
			throw new Error(
				'Airline name must start with capital letters for each word and contain only letters and spaces'
			);
		}

		// Check length separately
		if (airlineName.length > 20) {
			throw new Error('Airline name must be under 20 characters');
		}

		// Temporary (initial) password can only be set by admin
		if (password) {
			throw new Error(
				'New airlines have to approved by admin before setting password!'
			);
		}

		// can only be verified by admin
		if (verificationStatus) {
			throw new Error('Airlines can only be verified by admin!');
		}

		// Backend check for user type;
		if (userType) {
			if (userType !== 'airline') {
				throw new Error('Airlines cannot register as customers or admins!');
			}
		}

		// making everything lowercase for normalizing data
		const lowerCaseEmail = email.toLowerCase();

		// Check for duplicate email (in users and airlines)
		const existingAirline = await Airline.findOne({ email: lowerCaseEmail });
		const duplicateUserEmail = await User.findOne({ email: lowerCaseEmail });
		if (existingAirline || duplicateUserEmail) {
			throw new Error('An airline with this email already exists!');
		}

		// Check for duplicate airline name (in users and airlines)
		const existingAirlineName = await Airline.findOne({ airlineName });
		const duplicateUsername = await User.findOne({ username: airlineName });
		if (existingAirlineName || duplicateUsername) {
			throw new Error('An airline with this name already exists!');
		}

		// Create new airline without password (will be set by admin later)
		const airline = new Airline({
			airlineName,
			email: lowerCaseEmail,
			verificationStatus: false, // starts as unverified
		});

		// save the airline
		await airline.save();

		// send response for successfull initial registration
		res.status(201).json({
			message:
				'Airline registration successful! Waiting for admin verification.',
			airline: {
				airlineName: airline.airlineName,
				email: airline.email,
				verificationStatus: airline.verificationStatus,
			},
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Login an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Ensures no user is logged in
 * 2. Checks if airline is verified
 * 3. Logs in if it is
 * 4. create a token
 * 5. sends cookie in response with token
 */
exports.login = async (req, res) => {
	try {
		// check that no user is logged in by checking no cookies exist
		const existingToken = req.cookies.token;
		if (existingToken) {
			throw new Error(
				'Another user / airline is already logged in on this session!'
			);
		}

		// destrcutre request body
		const { email, password } = req.body;

		// normalise email
		const lowerCaseEmail = email.toLowerCase();

		// find airline in db by email
		const airline = await Airline.findOne({ email: lowerCaseEmail });

		// throw error if no airline is found
		if (!airline) {
			throw new Error('No airline found with this email');
		}

		// throw error if airline is not verified
		if (!airline.verificationStatus) {
			throw new Error('Your account is pending verification by admin');
		}

		// Backend mandatory field check
		if (!email || !password) {
			throw new Error('Please provide both email and password');
		}

		// if airline is not verified
		if (!airline.password) {
			throw new Error('No password set. Please contact admin for access');
		}

		// match passwords after all checks
		const isMatch = await bcrypt.compare(password, airline.password);
		// console.log('Password match result:', isMatch);
		if (!isMatch) {
			throw new Error('Invalid password');
		}

		// create token
		const token = createToken(airline);

		// send response with cookie(token inside)
		res
			.cookie('token', token, {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				maxAge: 3600000, // 1 hour
			})
			.json({
				message: 'Login successful',
				airline: {
					airlineName: airline.airlineName,
					email: airline.email,
					verificationStatus: airline.verificationStatus,
				},
			});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Logout for airlines
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Checks if token exists in cookie
 * 2. Clears token in cookie if it does
 */
exports.logout = (req, res) => {
	try {
		// get token from cookie
		const token = req.cookies.token;

		// throw error if no cookie exists (logging out without logging in)
		if (!token) {
			throw new Error('Cannot log out! No user is logged in.');
		}

		// clear cookie
		res
			.cookie('token', '', {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				maxAge: 0,
			})
			.json({ message: 'Logged out successfully' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * get logged in (current) airline details (excluding password)
 * @param {*} req
 * @param {*} res
 */
exports.getMe = async (req, res) => {
	try {
		// get airline by id
		const airline = await Airline.findById(req.airline._id).select('-password');

		// throw error if airline not found
		if (!airline) {
			throw new Error('Airline not found');
		}

		// respond with airline details
		res.json(airline);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Update the password of the logged in airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Finds the airline by id
 * 2. Checks if airline is verified
 * 3. Compares old password with the one in the db
 * 4. Updates the password if it is correct
 * 5. Saves the airline
 */

exports.updatePassword = async (req, res) => {
	try {
		// find the user by id
		const { oldPassword, newPassword } = req.body;

		const airline = await Airline.findById(req.airline._id);

		if (!airline) {
			throw new Error('Airline not found');
		}

		if (!airline.verificationStatus) {
			throw new Error('Airline is not verified');
		}

		const match = await bcrypt.compare(oldPassword, airline.password);

		if (match) {
			airline.password = newPassword;
			airline.save();
			res.status(201).json({
				message: 'Password updated successfully',
			});
		} else {
			throw new Error('Incorrect old password');
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Update the profile picture of the logged in airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Finds the airline by id
 * 2. Checks if airline is verified
 * 3. Updates the profile picture
 */
exports.updateProfilePicture = async (req, res) => {
	try {
		const airline = await Airline.findById(req.airline._id);

		if (!airline) {
			throw new Error('Airline not found');
		}

		if (!airline.verificationStatus) {
			throw new Error('Airline is not verified');
		}

		airline.profilePicture = req.body.profilePicture;
		await airline.save();

		res.status(201).json({
			message: 'Profile picture updated successfully',
		});
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};