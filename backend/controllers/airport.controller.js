import { Airport } from '../models/airport.model.js';

/**
 * adds a new airport to the db
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const addAirport = async (req, res) => {
	try {
		// destructure req body
		const { airportName, airportCode, city, image } = req.body;

		// create new airport
		const airport = new Airport({ airportName, airportCode, city, image });

		// save airport
		await airport.save();

		// return success message
		return res.status(201).json({
			message: 'Airport created successfully',
			airport,
		});
	} catch (error) {
		
		// Handle duplicate key errors
		if (error.code === 11000) {
			return res.status(400).json({
				message: 'Airport with this name or code already exists',
			});
		}

		// Handle validation errors from pre-save middleware
		if (error.message) {
			return res.status(400).json({
				message: error.message,
			});
		}

		// Handle other errors
		return res.status(500).json({
			message: 'Failed to create airport. Please try again later.',
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
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Failed to retrieve airports. Please try again later.',
		});
	}
};

export { addAirport, getAllAirports };
