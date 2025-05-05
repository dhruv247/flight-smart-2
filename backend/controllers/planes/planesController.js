const Plane = require('../../models/Plane');

/**
 * Get all the planes from the db
 * @param {*} req
 * @param {*} res
 */
const getAllPlanes = async (req, res) => {
	try {
		const planes = await Plane.find({});

		res.status(200).json({
			message: 'Planes retrieved successfully',
			planes: planes,
		});
	} catch (error) {
		// console.error('Error in getting planes', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

/**
 * Creaate a new plane
 * @param {*} req
 * @param {*} res
 * @returns
 * @description
 * 1. Get all the plane details
 * 2. Create new plane
 */
const create = async (req, res) => {
	try {
		const { planeName, economyCapacity, businessCapacity } = req.body;

		if (!planeName || !economyCapacity || !businessCapacity) {
			return res.status(400).json({
				message: 'All fields are required',
			});
		}

		// Validate business class capacity
		if (businessCapacity < 4 || businessCapacity > 20) {
			return res.status(400).json({
				message: 'Business class capacity must be between 4 and 20',
			});
		}
		if (businessCapacity % 2 !== 0) {
			return res.status(400).json({
				message: 'Business class capacity must be divisible by 2',
			});
		}

		// Validate economy class capacity
		if (economyCapacity < 12 || economyCapacity > 60) {
			return res.status(400).json({
				message: 'Economy class capacity must be between 12 and 60',
			});
		}
		if (economyCapacity % 6 !== 0) {
			return res.status(400).json({
				message: 'Economy class capacity must be divisible by 6',
			});
		}

		const plane = new Plane({
			planeName,
			economyCapacity,
			businessCapacity,
		});

		await plane.save();

		res.status(201).json({
			message: 'Plane created successfully',
			plane,
		});
	} catch (error) {
		console.error('Error in creating plane:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

module.exports = {
	getAllPlanes,
	create,
};