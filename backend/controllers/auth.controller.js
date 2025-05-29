import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
	sendAirlineDeletionEmail,
	sendAirlineVerificationEmail,
} from '../utils/emailUtils.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Utility function create a jwt
 * @param {*} user
 * @returns
 */
const createToken = (user) => {
	return jwt.sign(
		{ _id: user._id, userType: user.userType },
		process.env.JWT_SECRET,
		{ expiresIn: '6h' }
	);
};

/**
 * Register a new customer
 * @param {*} req
 * @param {*} res
 * @returns
 */
const register = async (req, res) => {
	try {
		// destructure request body
		const { username, email, password, userType, profilePicture } = req.body;

		// normalize email
		let lowerCaseEmail = email.toLowerCase();

		// create User document
		const user = new User({
			username,
			email: lowerCaseEmail,
			password,
			userType,
			profilePicture,
			verificationStatus: userType === 'airline' ? false : true,
		});

		// save user
		await user.save();

		// if user is an airline, return success message
		if (user.userType === 'airline') {
			return res.status(201).json({
				message:
					'Airline Registration Request Sent! Please wait for email confirmation from admin before logging in',
			});
		} else {
			// if user is not an airline, return success message
			return res.status(201).json({ message: 'User registered' });
		}
	} catch (error) {


		// Handle duplicate key error (for unique email)
		if (error.code === 11000) {
			return res.status(400).json({ message: 'Email or username already exists' });
		}

		// Handle validation errors
		if (error.name === 'ValidationError') {
			return res.status(400).json({ message: error.message });
		}
		return res
			.status(500)
			.json({ message: 'Failed to register user. Please try again later.' });
	}
};

/**
 * Login an user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req, res) => {
	try {
		// get token from cookie
		const token = req.cookies.token;

		// throw error if another user is already logged in
		if (token) {
			return res.status(400).json({
				message:
					'User is already logged in! Please log out current user before trying to login',
			});
		}

		// destructure req body
		const { email, password } = req.body;

		// backend mandatory fields check
		if (!email || !password) {
			return res.status(400).json({
				message: 'Please fill in the mandatory fields: email, password',
			});
		}

		// normalize email
		const lowerCaseEmail = email.toLowerCase();

		// find user by email
		const user = await User.findOne({ email: lowerCaseEmail });

		if (!user) {
			return res.status(404).json({ message: 'No user found with this email' });
		} else {
			if (user.userType === 'airline' && !user.verificationStatus) {
				return res.status(400).json({
					message:
						'Airline is not verified! Please wait for confirmation from admin',
				});
			}

			// match given and stored passwords
			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				return res.status(400).json({ message: 'Incorrect Password' });
			} else {
				// create token after passing all conditions
				const token = createToken(user);

				// store token in cookie in the response
				res
					.cookie('token', token, {
						httpOnly: true,
						secure: false,
						sameSite: 'lax',
						maxAge: 21600000,
					})
					.status(200)
					.json({
						message: 'Login Successful!',
						userType: user.userType,
					});
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to login. Please try again later.' });
	}
};

/**
 * Logout user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const logout = (req, res) => {
	try {
		// get token from cookie
		const token = req.cookies.token;

		// if no token is found throw error
		if (!token) {
			return res
				.status(401)
				.json({ message: 'Cannot logout! No user is logged in.' });
		}

		// clear the token stored in cookie
		res.clearCookie('token').status(200).json({ message: 'Logged out' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to logout. Please try again later.' });
	}
};

/**
 * get logged in (current) user details
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getMe = async (req, res) => {
	try {
		// find the user by id (exclude password)
		const user = await User.findById(req.user._id).select('-password');

		// if no user is found throw error
		if (!user) {
			return res.status(404).json({ message: 'Cannot get user profile' });
		}

		// if user is an airline and is not verified, throw error
		if (user.userType === 'airline' && !user.verificationStatus) {
			return res.status(400).json({
				message:
					'Airline is not verified! Please wait for confirmation from admin',
			});
		}

		// return user details
		res.status(200).json(user);
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to get user profile. Please try again later.' });
	}
};

/**
 * Changes an airline's verification status to true
 * @param {*} req
 * @param {*} res
 * @returns
 */
const verifyAirline = async (req, res) => {
	try {
		// destructure req body
		const { airlineId } = req.body;

		// mandatory field check
		if (!airlineId) {
			return res
				.status(400)
				.json({ message: 'Airline ID is required in request body' });
		}

		// find airline by id
		const airline = await User.findById(airlineId);

		// if airline is not found, throw error
		if (!airline) {
			return res.status(404).json({ message: 'Airline not found' });
		}

		// if airline is already verified, throw error
		if (airline.verificationStatus) {
			return res.status(400).json({ message: 'Airline is already verified' });
		}

		// update verification status
		airline.verificationStatus = true;

		// save airline
		await airline.save();

		// Send email to airline
		try {
			await sendAirlineVerificationEmail(airline);
		} catch (emailError) {
			return res.status(500).json({
				message: 'Error sending password email:',
				error: emailError.message,
			});
		}

		// return success message
		return res.status(200).json({
			message: 'Airline verified successfully',
			airline: {
				id: airline._id,
				email: airline.email,
				verificationStatus: airline.verificationStatus,
			},
		});
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to verify airline. Please try again later.' });
	}
};

/**
 * Deletes an airline
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteAirline = async (req, res) => {
	try {
		// destructure req body
		const { airlineId } = req.body;

		// mandatory field check
		if (!airlineId) {
			return res
				.status(400)
				.json({ message: 'Airline Id is required in request body' });
		}

		// find airline by id
		const airline = await User.findById(airlineId);

		// if airline is not found, throw error
		if (!airline) {
			return res.status(404).json({ message: 'Airline not found!' });
		}

		// if airline is verified, throw error
		if (airline.verificationStatus) {
			return res
				.status(400)
				.json({ message: 'Verified airlines cannot be deleted!' });
		}

		// Send deletion email before deleting the airline
		try {
			await sendAirlineDeletionEmail(airline);
		} catch (emailError) {
			return res.status(500).json({
				message: 'Error sending deletion email:',
				error: emailError.message,
			});
		}

		// delete airline
		await User.findByIdAndDelete(airlineId);

		// return success message
		return res.status(200).json({ message: 'Airline deleted successfully' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to delete airline. Please try again later.' });
	}
};

/**
 * Get's airlines from db
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getAllAirlines = async (req, res) => {
	try {
		// find all airlines
		const airlines = await User.find({ userType: 'airline' });

		// return success message
		return res.status(200).json({
			airlines: airlines,
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Failed to retrieve airlines. Please try again later.',
		});
	}
};

export {
	register,
	login,
	logout,
	getMe,
	verifyAirline,
	deleteAirline,
	getAllAirlines,
};
