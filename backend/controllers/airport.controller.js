import { Airport } from '../models/airport.model.js';

/**
 * Adds a new airport to the database
 * @param {*} req
 * @param {*} res
 * @returns {Object} airport
 */
const addAirport = async (req, res) => {
	
	try {

		// destructure req body
		const { airportName, airportCode, city, state, country, image } = req.body;

		// mandatory fields
		if (!airportName || !airportCode || !city || !state || !country || !image) {
			return res.status(400).json({
				message: 'All fields are required',
			});
		}

		// create new airport
		const airport = new Airport({ airportName, airportCode, city, state, country, image });

		// save airport
		await airport.save();

		// return success message
		return res.status(201).json({
			message: 'Airport created successfully',
			airport,
		});
	} catch (error) {
		if (error.code === 11000) {
			// mongo db duplicate key error
			return res.status(400).json({
				message: 'Airport with this name or code already exists',
			});
		}

		// return error message
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * Get's all airports from db
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getAllAirports = async (req, res) => {
	try {
		// get all airports
		const airports = await Airport.find({});

		// return success message
		return res.status(200).json({
			airports,
			message: 'Airports retrieved Successfully',
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

export { addAirport, getAllAirports };