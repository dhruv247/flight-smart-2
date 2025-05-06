const City = require('../../models/City');
const { validationResult } = require('express-validator');

/**
 * Creates new cities
 * @param {*} req 
 * @param {*} res 
 * @description
 * 1. validates city name
 * 2. saves city to db
 */
exports.create = async (req, res) => {
	
  const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			errors: errors.array(),
		});
  }
  
  try {
    
		const { name, image } = req.body;

		if (!image) {
			return res.status(400).json({
				success: false,
				message: 'Image is required',
			});
		}

		// Create new city
		const city = new City({ name, image });
		await city.save();

		res.status(201).json({
			success: true,
			message: 'City created successfully',
			data: city,
    });
    
	} catch (error) {
		
    if (error.code === 11000) {
			// MongoDB duplicate key error
			return res.status(400).json({
				success: false,
				message: 'City with this name already exists',
			});
		}

		res.status(500).json({
			success: false,
			message: 'Error creating city',
			error: error.message,
		});
	}
};

/**
 * Get's all cities from db
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getAll = async (req, res) => {
  try {
    const cities = await City.find({});
    return res.status(201).json({
      cities,
      success: true,
      message: "Cities retrieved Successfully"
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    })
  }
}