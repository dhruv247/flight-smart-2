const Ticket = require('../../models/Ticket');
const Flight = require('../../models/Flight');

/**
 * Get's the top flights by number of Tickets (only departure flights for now)
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get the top departure flights by number of tickets
 * 2. Get the flight details for the top flights (using map here as the operation is limited by the number of flights)
 */
exports.flights = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 3; // Default to 10 if not provided

		const departureFlights = await Ticket.aggregate([
			{
				$group: {
					_id: '$departureFlight._id',
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
					flightId: '$_id',
					count: 1,
				},
			},
		]);

		const idList = departureFlights.map((doc) => doc.flightId);

		// Get the flight details for the top flights (using map here as the operation is limited by the number of flights)
		const flights = await Promise.all(
			idList.map(async (id) => {
				const flight = await Flight.findById(id);
				return {
					flightNo: flight.flightNo,
					count: departureFlights.find((f) => f.flightId === id).count,
				};
			})
		);

		res.json(flights);
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
