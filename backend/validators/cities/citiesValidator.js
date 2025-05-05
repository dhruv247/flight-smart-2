const { body } = require('express-validator');

/**
 * Checks wether city name is according to required format
 */
exports.cityNameValidation = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('City name is required')
		.isLength({ min: 3, max: 15 })
		.withMessage('City name must be between 2 and 50 characters')
		.matches(/^[a-zA-Z\s-]+$/)
		.withMessage('City name can only contain letters, spaces, and hyphens'),
];