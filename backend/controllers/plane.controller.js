import { Plane } from '../models/plane.model.js';

/**
 * Create a new plane
 * @param {*} req
 * @param {*} res
 * @returns {Object} message
 */
const addPlane = async (req, res) => {
	try {

		// destructure req body
		const { planeName, economyCapacity, businessCapacity } = req.body;

		// validate required fields
		if (!planeName || !economyCapacity || !businessCapacity) {
			return res.status(400).json({
				message: 'All fields are required',
			});
		}

		// check if plane already exists
		const existingPlane = await Plane.findOne({ planeName });
		if (existingPlane) {
			return res.status(400).json({
				message: 'Plane already exists',
			});
		}

		// validate business class capacity
		if (businessCapacity < 4 || businessCapacity > 20) {
			return res.status(400).json({
				message: 'Business class capacity must be between 4 and 20',
			});
		}

		// validate business class capacity is even
		if (businessCapacity % 2 !== 0) {
			return res.status(400).json({
				message: 'Business class capacity must be divisible by 2',
			});
		}

		// validate economy class capacity
		if (economyCapacity < 12 || economyCapacity > 60) {
			return res.status(400).json({
				message: 'Economy class capacity must be between 12 and 60',
			});
		}

		// validate economy class capacity is divisible by 6
		if (economyCapacity % 6 !== 0) {
			return res.status(400).json({
				message: 'Economy class capacity must be divisible by 6',
			});
		}

		// check if economy capacity is greater than business capacity
		if (economyCapacity <= businessCapacity) {
			return res.status(400).json({
				message: 'Economy class capacity must be greater than business class capacity',
			});
		}

		// create new plane
		const plane = new Plane({
			planeName,
			economyCapacity,
			businessCapacity,
		});

		// save plane
		await plane.save();

		// return success message
		return res.status(201).json({
			message: 'Plane created successfully',
			plane,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

/**
 * Get all the planes from the db
 * @param {*} req
 * @param {*} res
 */
const getAllPlanes = async (req, res) => {
	try {

		// get all planes
		const planes = await Plane.find({});

		// return success message
		return res.status(200).json({
			message: 'Planes retrieved successfully',
			planes: planes,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export { getAllPlanes, addPlane };