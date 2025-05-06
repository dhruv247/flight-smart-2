// this file is used by admin to verify airlines before they can create flights
const User = require('../../models/User');
const {
	sendAirlineDeletionEmail,
	sendAirlineVerificationEmail,
} = require('../../utils/emailUtils');

/**
 * Changes an airline's verification status to true
 * @param {*} req 
 * @param {*} res 
 * @description
 * 1. Get's the airline's id
 * 2. Checks if airline exists in db
 * 3. Checks that airline is unverfied
 * 4. Changes verification status to true and saves
 */
const verifyAirline = async (req, res) => {
	try {

		const { airlineId } = req.body;

		if (!airlineId) {
			return res
				.status(400)
				.json({ message: 'Airline ID is required in request body' });
		}

		const airline = await User.findById(airlineId);

		if (!airline) {
			return res.status(404).json({ message: 'Airline not found' });
		}

		if (airline.verificationStatus) {
			return res.status(400).json({ message: 'Airline is already verified' });
		}

		airline.verificationStatus = true;

		await airline.save();

		// Send email to airline with their password
		try {
			await sendAirlineVerificationEmail(airline);
			// console.log('Password email sent successfully to airline');
		} catch (emailError) {
			console.error('Error sending password email:', emailError);
		}

		res.status(200).json({
			message: 'Airline verified successfully',
			airline: {
				id: airline._id,
				email: airline.email,
				verificationStatus: airline.verificationStatus,
			},
		});
	} catch (error) {
		// console.error('Error in verifyAirline:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// /**
//  * Generates a password for airlines
//  * @param {*} req 
//  * @param {*} res 
//  * @description
//  * 1. Gets the airline
//  * 2. Checks that the airline is verified
//  * 3. Generates new password using utility function
//  * 4. Sends email to airline on success
//  */
// const generateAirlinePassword = async (req, res) => {
// 	try {

// 		const { airlineId } = req.body;

// 		if (!airlineId) {
// 			return res
// 				.status(400)
// 				.json({ message: 'Airline ID is required in request body' });
// 		}

// 		const airline = await Airline.findById(airlineId);
// 		if (!airline) {
// 			return res.status(404).json({ message: 'Airline not found' });
// 		}

// 		if (!airline.verificationStatus) {
// 			return res
// 				.status(400)
// 				.json({ message: 'Airline must be verified first' });
// 		}

// 		const newPassword = generateRandomPassword();

// 		airline.password = newPassword;
// 		await airline.save();

// 		// console.log('Airline updated successfully');

// 		// Send email to airline with their password
// 		try {
// 			await sendAirlinePasswordEmail(airline, newPassword);
// 			// console.log('Password email sent successfully to airline');
// 		} catch (emailError) {
// 			// console.error('Error sending password email:', emailError);
// 		}

// 		res.status(200).json({
// 			message: 'Password generated successfully',
// 			airline: {
// 				id: airline._id,
// 				airlineName: airline.airlineName,
// 				email: airline.email,
// 				password: newPassword,
// 			},
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			message: 'Internal server error',
// 			error: error.message,
// 		});
// 	}
// };

/**
 * Deletes an airline
 * @param {*} req 
 * @param {*} res 
 * @returns
 * 1. GEts the airline using id
 * 2. IF the airline is unverfied, delete it
 * 3. Sends email on deletion
 */
const deleteAirline = async (req, res) => {
	try {
		const { airlineId } = req.body;

		if (!airlineId) {
			return res
				.status(400)
				.json({ message: 'Airline Id is required in request body' });
		}

		const airline = await User.findById(airlineId);

		if (!airline) {
			return res.status(404).json({ message: 'Airline not found!' });
		}

		if (airline.verificationStatus) {
			return res
				.status(400)
				.json({ message: 'Verified airlines cannot be deleted!' });
		}

		// Send deletion email before deleting the airline
		try {
			await sendAirlineDeletionEmail(airline);
			// console.log('Deletion email sent successfully to airline');
		} catch (emailError) {
			// console.error('Error sending deletion email:', emailError);
		}

		await User.findByIdAndDelete(airlineId);

		res.status(200).json({ message: 'Airline deleted successfully' });
	} catch (error) {
		// console.error('Error in deleteAirline:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

/**
 * Get's airlines from db
 * @param {*} req 
 * @param {*} res 
 */
const getAllAirlines = async (req, res) => {
	try {
		const airlines = await User.find({ userType: 'airline' });

		res.status(200).json({
			message: 'Airlines retrieved successfully',
			airlines: airlines,
		});
	} catch (error) {
		// console.error('Error in getAllAirlines:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

module.exports = {
	verifyAirline,
	deleteAirline,
	getAllAirlines,
};