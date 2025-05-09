import { City } from '../models/city.model.js';
import { validationResult } from 'express-validator';

/**
 * Creates new cities
 * @param {*} req
 * @param {*} res
 * @description
 * 1. validates city name
 * 2. saves city to db
 */
const addCity = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			errors: errors.array(),
		});
	}

	try {

		// destructure req body
		const { name, image } = req.body;

		// check if image is required
		if (!image) {
			return res.status(400).json({
				success: false,
				message: 'Image is required',
			});
		}

		// create new city
		const city = new City({ name, image });

		// save city
		await city.save();

		// return success message
		return res.status(201).json({
			message: 'City created successfully',
			data: city,
		});
	} catch (error) {
		if (error.code === 11000) {
			// mongo db duplicate key error
			return res.status(400).json({
				message: 'City with this name already exists',
			});
		}

		// return error message
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * Get's all cities from db
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getAllCities = async (req, res) => {
	try {

		// get all cities
		const cities = await City.find({});

		// return success message
		return res.status(200).json({
			cities,
			message: 'Cities retrieved Successfully',
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

export { addCity, getAllCities };
