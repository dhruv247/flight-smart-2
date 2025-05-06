const mongoose = require('mongoose');
const Flight = require('../../models/Flight');

/**
 * Get's the top profitable economy flights for an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Calculates the profit score for each flight (economyCurrentPrice / duration)
 * 2. Sorts the flights by profit score in descending order
 * 3. Limits the number of flights
 * 4. Returns the top flights
 */
exports.profitableEconomyFlights = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const limit = parseInt(req.query.limit) || 10; // Default to 10 if limit not specified

		const profitableFlights = await Flight.aggregate([
			{
				$match: {
					'airlineDetails._id': new mongoose.Types.ObjectId(airlineId),
				},
			},
			{
				$addFields: {
					profitScore: {
						$round: [{ $divide: ['$economyCurrentPrice', '$duration'] }, 0],
					},
				},
			},
			{ $sort: { profitScore: -1 } },
			{ $limit: limit },
			{
				$project: {
					flightNo: 1,
					profitScore: 1,
					_id: 0,
				},
			},
		]);

		res.status(200).json(profitableFlights);
	} catch (error) {
		// console.error('Error in profitableEconomyFlights:', error);
		res.status(500).json({ message: 'Error fetching profitable flights data' });
	}
};

/**
 * Get's the top profitable business flights
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Calculates the profit score for each flight (businessCurrentPrice / duration)
 * 2. Sorts the flights by profit score in descending order
 * 3. Limits the number of flights to the limit specified in the query
 * 4. Returns the top flights
 */
exports.profitableBusinessFlights = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const limit = parseInt(req.query.limit) || 10; // Default to 10 if limit not specified

		const profitableFlights = await Flight.aggregate([
			{
				$match: {
					'airlineDetails._id': new mongoose.Types.ObjectId(airlineId),
				},
			},
			{
				$addFields: {
					profitScore: {
						$round: [{ $divide: ['$businessCurrentPrice', '$duration'] }, 0],
					},
				},
			},
			{ $sort: { profitScore: -1 } },
			{ $limit: limit },
			{
				$project: {
					flightNo: 1,
					profitScore: 1,
					_id: 0,
				},
			},
		]);

		res.status(200).json(profitableFlights);
	} catch (error) {
		// console.error('Error in profitableBusinessFlights:', error);
		res.status(500).json({ message: 'Error fetching profitable flights data' });
	}
};

/**
 * Get's the busiest dates for an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Gets the busiest dates for an airline
 * 2. Returns the busiest dates
 */
exports.busyDates = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const limit = parseInt(req.query.limit) || 10;

		const busyDates = await Flight.aggregate([
			{
				$match: {
					'airlineDetails._id': new mongoose.Types.ObjectId(airlineId),
				},
			},
			{
				$group: {
					_id: '$departureDate',
					flightCount: { $sum: 1 },
				},
			},
			{ $sort: { flightCount: -1 } },
			{ $limit: limit },
			{
				$project: {
					date: '$_id',
					flightCount: 1,
					_id: 0,
				},
			},
		]);

		res.status(200).json(busyDates);
	} catch (error) {
		// console.error('Error in busyDates:', error);
		res.status(500).json({ message: 'Error fetching busy dates data' });
	}
};

/**
 * Get's the number of flights by duration for an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Gets the number of flights by duration for an airline
 */
exports.flightByDuration = async (req, res) => {
	try {
		const airlineId = req.user._id;

		const tripTypes = await Flight.aggregate([
			{
				$match: {
					'airlineDetails._id': new mongoose.Types.ObjectId(airlineId),
				},
			},
			{
				$group: {
					_id: {
						$switch: {
							branches: [
								{ case: { $lt: ['$duration', 120] }, then: '1-2 hours' },
								{ case: { $lt: ['$duration', 180] }, then: '2-3 hours' },
								{ case: { $lt: ['$duration', 240] }, then: '3-4 hours' },
							],
						},
					},
					flightCount: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
			{
				$project: {
					durationRange: '$_id',
					flightCount: 1,
					_id: 0,
				},
			},
		]);

		res.status(200).json(tripTypes);
	} catch (error) {
		// console.error('Error in tripTypes:', error);
		res.status(500).json({ message: 'Error fetching trip types data' });
	}
};