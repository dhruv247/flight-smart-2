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
 * Register a new customer
 * @param {*} req
 * @param {*} res
 */
const register = async (req, res) => {
	try {
		// destructure request body
		const { username, email, password, userType } = req.body;

		// mandatory field check for backend
		if (!username || !email || !password || !userType) {
			return res
				.status(400)
				.json({
					message:
						'Please fill in the mandatory fields: email, username, password',
				});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res
				.status(400)
				.json({ message: 'Please provide a valid email address' });
		}

		// Validate username length
		if (username.length > 30) {
			return res
				.status(400)
				.json({ message: 'Username must be less than 30 characters' });
		}

		// Validate password complexity
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(password)) {
			return res
				.status(400)
				.json({
					message:
						'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
				});
		}

		// throw error as admin's cannot be manually registered
		if (userType === 'admin') {
			return res
				.status(400)
				.json({ message: 'Admin cannot be created through registration' });
		}

		let verificationStatus = true;

		// if user is an airline, set verification status to false
		if (userType === 'airline') {
			verificationStatus = false;
		}

		// normalize email
		let lowerCaseEmail = email.toLowerCase();

		// check for duplicate email
		const duplicateEmail = await User.findOne({ email: lowerCaseEmail });

		// check for duplicate username
		const duplicateUsername = await User.findOne({ username });

		if (duplicateEmail) {
			return res
				.status(400)
				.json({ message: 'User with the same email already exists!' });
		}

		if (duplicateUsername) {
			return res
				.status(400)
				.json({ message: 'User with the same username already exists!' });
		}

		// create User document
		const user = new User({
			username,
			email: lowerCaseEmail,
			password,
			userType,
			verificationStatus,
		});

		// save user
		await user.save();

		if (user.userType === 'airline') {
			return res.status(201).json({
				message:
					'Airline Registration Request Sent! Please wait for email confirmation from admin before logging in',
				...user.toJSON(),
			});
		} else {
			return res
				.status(201)
				.json({ message: 'User registered', ...user.toJSON() });
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Login an user
 * @param {*} req
 * @param {*} res
 */
const login = async (req, res) => {
	try {
		// get token from cookie
		const token = req.cookies.token;

		// throw error if another user is already logged in
		if (token) {
			return res
				.status(400)
				.json({
					message:
						'User is already logged in! Please log out current user before trying to login',
				});
		}

		// destructure req body
		const { email, password } = req.body;

		// backend mandatory fields check
		if (!email || !password) {
			return res
				.status(400)
				.json({
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
				return res
					.status(400)
					.json({
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
						maxAge: 3600000,
					})
					.status(200)
					.json({
						message: 'Login Successful!',
						userType: user.userType,
					});
			}
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Logout user
 * @param {*} req
 * @param {*} res
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
		return res.status(500).json({ message: error.message });
	}
};

/**
 * get logged in (current) user details
 * @param {*} req
 * @param {*} res
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
			return res
				.status(400)
				.json({
					message:
						'Airline is not verified! Please wait for confirmation from admin',
				});
		}

		// return user details
		res.status(200).json(user);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Update the password of the logged in user
 * @param {*} req
 * @param {*} res
 */
const updatePassword = async (req, res) => {
	try {
		// destructure req body
		const { oldPassword, newPassword } = req.body;

		// mandatory fields check
		if (!oldPassword || !newPassword) {
			return res
				.status(400)
				.json({ message: 'Old and new passwords are required' });
		}

		// find the user by id
		const user = await User.findById(req.user._id);

		// compare old password with the one in the db
		const match = await bcrypt.compare(oldPassword, user.password);

		if (match) {
			// validate password complexity
			const passwordRegex =
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
			if (!passwordRegex.test(newPassword)) {
				return res
					.status(400)
					.json({
						message:
							'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
					});
			}

			// update password
			user.password = newPassword;
			await user.save();

			// return success message
			res.status(200).json({
				message: 'Password updated successfully',
			});
		} else {
			return res.status(400).json({ message: 'Incorrect old password' });
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Update the profile picture of the logged in user
 * @param {*} req
 * @param {*} res
 */
const updateProfilePicture = async (req, res) => {
	try {
		// destructure req body
		const { profilePicture } = req.body;

		// mandatory field check
		if (!profilePicture) {
			return res.status(400).json({ message: 'Profile picture is required' });
		}

		// find user by id
		const user = await User.findById(req.user._id);

		// if user is not found, throw error
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		user.profilePicture = profilePicture;
		await user.save();

		// return success message
		res.status(200).json({
			message: 'Profile picture updated successfully',
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Changes an airline's verification status to true
 * @param {*} req
 * @param {*} res
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

		// Send email to airline with their password
		try {
			await sendAirlineVerificationEmail(airline);
		} catch (emailError) {
			return res
				.status(500)
				.json({
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
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Deletes an airline
 * @param {*} req
 * @param {*} res
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
			return res
				.status(500)
				.json({
					message: 'Error sending deletion email:',
					error: emailError.message,
				});
		}

		// delete airline
		await User.findByIdAndDelete(airlineId);

		// return success message
		return res.status(200).json({ message: 'Airline deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Get's airlines from db
 * @param {*} req
 * @param {*} res
 */
const getAllAirlines = async (req, res) => {
	try {
		// find all airlines
		const airlines = await User.find({ userType: 'airline' });

		// return success message
		return res.status(200).json({
			message: 'Airlines retrieved successfully',
			airlines: airlines,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export {
	register,
	login,
	logout,
	getMe,
	updatePassword,
	updateProfilePicture,
	verifyAirline,
	deleteAirline,
	getAllAirlines,
};
