import { Plane } from '../models/plane.model.js';

/**
 * Create a new plane
 * @param {*} req
 * @param {*} res
 * @returns
 */
const addPlane = async (req, res) => {
	try {
		// destructure req body
		const { planeName, economyCapacity, businessCapacity } = req.body;

		// Convert capacities to numbers
		const economyCap = Number(economyCapacity);
		const businessCap = Number(businessCapacity);

		// create new plane
		const plane = new Plane({
			planeName,
			economyCapacity: economyCap,
			businessCapacity: businessCap,
		});

		// save plane
		await plane.save();

		// return success message
		return res.status(201).json({
			message: 'Plane created successfully',
			plane,
		});
	} catch (error) {

		// Handle duplicate key error (for unique planeName)
		if (error.code === 11000) {
			return res.status(400).json({ message: 'Plane already exists' });
		}

		// Handle validation errors
		if (error.message) {
			return res.status(400).json({ message: error.message });
		}

		return res
			.status(500)
			.json({ message: 'Failed to create plane. Please try again later.' });
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
			planes: planes,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Failed to get all planes. Please try again later.' });
	}
};

export { getAllPlanes, addPlane };
