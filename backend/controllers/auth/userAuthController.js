const User = require('../../models/User');
const Airline = require('../../models/Airline');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Utility function create a jwt
 * @param {*} airline
 * @returns
 */
const createToken = (user) => {
	return jwt.sign(
		{ _id: user._id, userType: user.userType },
		process.env.JWT_SECRET,
		{ expiresIn: '2h' }
	);
};

/**
 * REgister a new customer
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Gets the user details from the body
 * 2. Checks user is of type customer
 * 3. checks for duplicates in db
 * 4. create's new customer
 */
exports.register = async (req, res) => {
	try {
		// destructure request body
		const { username, email, password, userType } = req.body;

		// mandatory field check for backend
		if (!username || !email || !password) {
			throw new Error(
				'Please fill in the mandatory fields: email, username, password'
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error('Please provide a valid email address');
		}

		// Validate username length
		if (username.length > 10) {
			throw new Error('Username must be less than 10 characters');
		}

		// Validate password complexity
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(password)) {
			throw new Error(
				'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
			);
		}

		// throw error as admin's cannot be manually registered
		if (userType === 'admin') {
			throw new Error('Admin cannot be created through registration');
		}

		// throw error if user tries to set userType as airline
		if (userType === 'airline') {
			throw new Error('Customers cannot register as airlines!');
		}

		// normalize email
		let lowerCaseEmail = email.toLowerCase();

		// check for duplicate email (in Users and airlines)
		const duplicateUserEmail = await User.findOne({ email: lowerCaseEmail });
		const duplicateAirlineEmail = await Airline.findOne({
			emaiL: lowerCaseEmail,
		});

		// check for duplicate usernmaes (in Users and airlines)
		const duplicateUserUsername = await User.findOne({ username });
		const duplicateAirlineUsername = await Airline.findOne({ username });

		if (duplicateUserEmail || duplicateAirlineEmail) {
			throw new Error('User with the same email already exists!');
		}

		if (duplicateUserUsername || duplicateAirlineUsername) {
			throw new Error('User with the same username already exists!');
		}

		// create User document
		const user = new User({
			username,
			email: lowerCaseEmail,
			password,
			userType,
		});

		// Save the user which will trigger validation middleware
		await user.save();

		res.status(201).json({ message: 'User registered', ...user.toJSON() });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Login an user
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Ensures no user is logged in
 * 2. Logs in
 * 3. create a token
 * 4. sends cookie in response with token
 */
exports.login = async (req, res) => {
	try {
		// get token from cookie
		const token = req.cookies.token;

		// throw error if another user is already logged in
		if (token) {
			throw new Error(
				'User is already logged in! Please log out current user before trying to login'
			);
		}

		// destrcture req body
		const { email, password } = req.body;

		// backend mandaotry fields check
		if (!email || !password) {
			throw new Error('Please fill in the mandatory fields: email, password');
		}

		// normalize email
		const lowerCaseEmail = email.toLowerCase();

		// Find User document in User model by email
		const user = await User.findOne({ email: lowerCaseEmail });

		if (!user) {
			throw new Error('No user found with this email');
		} else {
			// match given and stored passowrds
			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				throw new Error('Incorrect Password');
			} else {
				// create token after passing all conditions
				const token = createToken(user);

				// store token in cookie in the response
				res
					.cookie('token', token, {
						httpOnly: true,
						secure: false,
						sameSite: 'lax',
						maxAge: 3600000,
					})
					.json({
						message: 'Login Successful!',
						userType: user.userType,
					});
			}
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Logout for users
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

		// if no token is found throw error
		if (!token) {
			throw new Error('Cannot logout! No user is logged in.');
		}

		// clear the token stored in cookie
		res.clearCookie('token').json({ message: 'Logged out' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * get logged in (current) user details
 * @param {*} req
 * @param {*} res
 */
exports.getMe = async (req, res) => {
	try {
		// find the user by id (exclude password)
		const user = await User.findById(req.user._id).select('-password');

		// if no user is found throw error
		if (!user) {
			throw new Error('Cannot get user profile');
		}

		res.json(user);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

/**
 * Update the password of the logged in user
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Finds the user by id
 * 2. Compares old password with the one in the db
 * 3. Updates the password if it is correct
 * 4. Saves the user
 */
exports.updatePassword = async (req, res) => {
	try {
		// find the user by id
		const { oldPassword, newPassword } = req.body;

		const user = await User.findById(req.user._id);

		const match = await bcrypt.compare(oldPassword, user.password);

		if (match) {
			user.password = newPassword;
			user.save();
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
