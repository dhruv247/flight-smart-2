const Ticket = require('../../models/Ticket');
const Flight = require('../../models/Flight');
const Booking = require('../../models/Booking');

/**
 * Get's the top flights by number of Tickets (only departure flights for now)
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get the top departure flights by number of tickets using a single aggregation pipeline
 * 2. Uses embedded flight data from the Booking model for better performance
 */
exports.flights = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 5; // Default to 3 if not provided

		const topFlights = await Booking.aggregate([
			// Unwind the tickets array to work with individual tickets
			{ $unwind: '$tickets' },
			// Group by departure flight details
			{
				$group: {
					_id: '$tickets.departureFlight._id',
					flightNo: { $first: '$tickets.departureFlight.flightNo' },
					airline: { $first: '$tickets.departureFlight.airline' },
					departurePlace: { $first: '$tickets.departureFlight.departurePlace' },
					arrivalPlace: { $first: '$tickets.departureFlight.arrivalPlace' },
					count: { $sum: 1 },
				},
			},
			// Sort by count in descending order
			{ $sort: { count: -1 } },
			// Limit to requested number of results
			{ $limit: num },
			// Project final output format
			{
				$project: {
					_id: 0,
					flightNo: 1,
					// airline: 1,
					// departurePlace: 1,
					// arrivalPlace: 1,
					count: 1,
				},
			},
		]);

		res.json(topFlights);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top airlines by number of flights
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get the top airlines by number of flights
 */
exports.topAirlines = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 10; // Default to 10 if not provided

		const topAirlines = await Flight.aggregate([
			{
				$group: {
					_id: '$airlineDetails._id',
					// Since all flights are from the same airline, we can just take the first one
					airlineName: { $first: '$airlineDetails.airlineName' },
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: num,
			},
			{
				$project: {
					_id: 0,
					airlineId: '$_id',
					airlineName: 1,
					count: 1,
				},
			},
		]);

		res.json(topAirlines);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top cities by number of flights (only departure flights for now)
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get the top cities by number of flights
 */
exports.topCities = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 10; // Default to 10 if not provided

		const topCities = await Flight.aggregate([
			{
				$group: {
					_id: '$departurePlace',
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: num,
			},
			{
				$project: {
					_id: 0,
					city: '$_id',
					count: 1,
				},
			},
		]);

		res.json(topCities);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top planes by number of flights
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get the top planes by number of flights
 */
exports.topPlanes = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 10; // Default to 10 if not provided

		const topPlanes = await Flight.aggregate([
			{
				$group: {
					_id: '$planeDetails._id',
					// Since all flights are from the same plane, we can just take the first one
					planeName: { $first: '$planeDetails.planeName' },
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: num,
			},
			{
				$project: {
					_id: 0,
					planeId: '$_id',
					planeName: 1,
					count: 1,
				},
			},
		]);

		res.json(topPlanes);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
