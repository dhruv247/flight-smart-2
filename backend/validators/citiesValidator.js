import { body } from 'express-validator';

/**
 * Validate city name
 * @returns {Array} - An array of validation rules
 * @description
 * 1. Trim the city name
 * 2. Check if the city name is not empty
 * 3. Check if the city name is between 2 and 50 characters
 * 4. Check if the city name contains only letters, spaces, and hyphens
 */
const cityNameValidation = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('City name is required')
		.isLength({ min: 3, max: 15 })
		.withMessage('City name must be between 2 and 50 characters')
		.matches(/^[a-zA-Z\s-]+$/)
		.withMessage('City name can only contain letters, spaces, and hyphens'),
];

export { cityNameValidation };