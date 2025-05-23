import mongoose from 'mongoose';
import { Booking } from '../models/booking.model.js';
import { Flight } from '../models/flight.model.js';
import { Ticket } from '../models/ticket.model.js';
import { getCache, setCache } from '../utils/redisUtils.js';

// -----------------------------------------------------------------------------------------------
// Admin Analytics Functions
// ------------------------------------------------------------------------------------------------

/**
 * Get's the top departure times
 * @param {*} req
 * @param {*} res
 * @returns {Object} topDepartureTimes
 */
const topDepartureTimes = async (req, res) => {
	try {
		// const startDate = new Date(req.query.startDate);
		// const endDate = new Date(req.query.endDate);

		// // Set time to start and end of day
		// startDate.setHours(0, 0, 0, 0);
		// endDate.setHours(23, 59, 59, 999);

		// get top departure times
		const topDepartureTimes = await Flight.aggregate([
			// {
			// 	$match: {
			// 		departureDateTime: {
			// 			$gte: startDate,
			// 			$lte: endDate,
			// 		},
			// 	},
			// },
			{
				$group: {
					_id: {
						$switch: {
							branches: [
								{
									case: {
										$and: [
											{ $gte: [{ $hour: '$departureDateTime' }, 0] },
											{ $lte: [{ $hour: '$departureDateTime' }, 6] },
										],
									},
									then: '0001-0600',
								},
								{
									case: {
										$and: [
											{ $gte: [{ $hour: '$departureDateTime' }, 6] },
											{ $lte: [{ $hour: '$departureDateTime' }, 12] },
										],
									},
									then: '0601-1200',
								},
								{
									case: {
										$and: [
											{ $gte: [{ $hour: '$departureDateTime' }, 12] },
											{ $lte: [{ $hour: '$departureDateTime' }, 18] },
										],
									},
									then: '1201-1800',
								},
								{
									case: {
										$and: [
											{ $gte: [{ $hour: '$departureDateTime' }, 18] },
											{ $lte: [{ $hour: '$departureDateTime' }, 23] },
										],
									},
									then: '1801-0000',
								},
							],
							default: '0001-0600',
						},
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// return top departure times
		res.status(200).json(topDepartureTimes);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top airlines by number of flights
 * @param {*} req
 * @param {*} res
 * @returns {Object} topAirlines
 */
const topAirlinesByNumberOfFlights = async (req, res) => {
	try {
		// get number of airlines to return
		const limit = parseInt(req.query.limit) || 5;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		// get top airlines
		const topAirlines = await Flight.aggregate([
			{
				$match: {
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: '$airline._id',
					// Since all flights are from the same airline, we can just take the first one
					airlineName: { $first: '$airline.airlineName' },
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: limit,
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

		// return top airlines
		res.status(200).json(topAirlines);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top cities by number of flights (only departure flights for now - change this in the future to also include return flights)
 * @param {*} req
 * @param {*} res
 * @returns {Object} topCities
 */
const topCitiesByNumberOfFlights = async (req, res) => {
	try {
		// get number of cities to return
		const limit = parseInt(req.query.limit) || 5;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		// get top cities
		const topCities = await Flight.aggregate([
			{
				$match: {
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: '$arrivalAirport.city',
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: limit,
			},
			{
				$project: {
					_id: 0,
					city: '$_id',
					count: 1,
				},
			},
		]);

		// return top cities
		res.status(200).json(topCities);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top planes by number of flights
 * @param {*} req
 * @param {*} res
 * @returns {Object} topPlanes
 */
const topPlanesByNumberOfFlights = async (req, res) => {
	try {
		// get number of planes to return
		const limit = parseInt(req.query.limit) || 5;

		const startDate = new Date(req.query.startDate);

		startDate.setHours(0, 0, 0, 0);

		const endDate = new Date(req.query.endDate);

		endDate.setHours(23, 59, 59, 999);

		// get top planes
		const topPlanes = await Flight.aggregate([
			{
				$match: {
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: '$plane._id',
					// Since all flights are from the same plane, we can just take the first one
					planeName: { $first: '$plane.planeName' },
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: limit,
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

		// return top planes
		res.status(200).json(topPlanes);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top routes by number of flights
 * @param {*} req
 * @param {*} res
 * @returns {Object} topRoutes
 */
const topRoutesByNumberOfFlights = async (req, res) => {
	try {
		// get number of routes to return
		const limit = parseInt(req.query.limit) || 5;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		const topRoutes = await Flight.aggregate([
			{
				$match: {
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: {
						departureAirport: '$departureAirport.city',
						arrivalAirport: '$arrivalAirport.city',
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: limit },
			{
				$project: {
					_id: 0,
					departureAirport: '$_id.departureAirport',
					arrivalAirport: '$_id.arrivalAirport',
					count: 1,
				},
			},
		]);

		// return top routes
		res.status(200).json(topRoutes);
	} catch (error) {
		console.error('Error in topRoutesByNumberOfFlights:', error);
		res.status(500).json({ message: error.message });
	}
};

const topTravelClassByOccupancy = async (req, res) => {
	try {
		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		const topTravelClass = await Flight.aggregate([
			{
				$match: {
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: '$travelClass',
					count: { $sum: 1 },
				},
			},
		]);

		// return top travel class
		res.status(200).json(topTravelClass);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// ------------------------------------------------------------------------------------------------
// Airline Analytics Functions
// ------------------------------------------------------------------------------------------------

/**
 * Get's the top profitable economy flights for an airline
 * @param {*} req
 * @param {*} res
 * @returns {Object} profitableFlights
 */
const profitableEconomyFlights = async (req, res) => {
	try {
		// get airline id
		const airlineId = req.user._id;

		// get number of flights to return
		const limit = parseInt(req.query.limit) || 5;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		// get profitable flights
		const profitableFlights = await Flight.aggregate([
			{
				$match: {
					'airline._id': new mongoose.Types.ObjectId(airlineId),
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
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

		// return profitable flights
		res.status(200).json(profitableFlights);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching profitable flights data' });
	}
};

/**
 * Get's the top profitable business flights
 * @param {*} req
 * @param {*} res
 * @returns {Object} profitableFlights
 */
const profitableBusinessFlights = async (req, res) => {
	try {
		// get airline id
		const airlineId = req.user._id;

		// get number of flights to return
		const limit = parseInt(req.query.limit) || 5;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		// get profitable flights
		const profitableFlights = await Flight.aggregate([
			{
				$match: {
					'airline._id': new mongoose.Types.ObjectId(airlineId),
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
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

		// return profitable flights
		res.status(200).json(profitableFlights);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching profitable flights data' });
	}
};

/**
 * Get's the busiest dates for an airline
 * @param {*} req
 * @param {*} res
 * @returns {Object} busyDates
 */
const topDatesByNumberOfFlights = async (req, res) => {
	try {
		// get airline id
		const airlineId = req.user._id;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		// get busy dates
		const busyDates = await Flight.aggregate([
			{
				$match: {
					'airline._id': new mongoose.Types.ObjectId(airlineId),
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: '%Y-%m-%d',
							date: '$departureDateTime',
						},
					},
					flightCount: { $sum: 1 },
				},
			},
			{ $sort: { flightCount: -1 } },
			{ $limit: 5 },
			{
				$project: {
					date: '$_id',
					flightCount: 1,
					_id: 0,
				},
			},
		]);

		// return busy dates
		res.status(200).json(busyDates);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching busy dates data' });
	}
};

/**
 * Get's the number of flights by duration for an airline
 * @param {*} req
 * @param {*} res
 * @returns {Object} tripTypes
 */
const flightByDuration = async (req, res) => {
	try {
		// get airline id
		const airlineId = req.user._id;

		const startDate = new Date(req.query.startDate);
		const endDate = new Date(req.query.endDate);

		// Set time to start and end of day
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);

		// get trip types
		const tripTypes = await Flight.aggregate([
			{
				$match: {
					'airline._id': new mongoose.Types.ObjectId(airlineId),
					departureDateTime: {
						$gte: startDate,
						$lte: endDate,
					},
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

		// return trip types
		res.status(200).json(tripTypes);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching trip types data' });
	}
};

/**
 * Get's the top economy occupancy flights for an airline
 * @param {*} req
 * @param {*} res
 * @returns {Object} topEconomyOccupancyFlights
 */
const topEconomyOccupancyFlights = async (req, res) => {
	try {
		// get airline id
		const airlineId = req.user._id;
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error fetching top economy occupancy flights data' });
	}
};

/**
 * Get's the top business occupancy flights for an airline
 * @param {*} req
 * @param {*} res
 * @returns {Object} topBusinessOccupancyFlights
 */
const topBusinessOccupancyFlights = async (req, res) => {
	try {
		// get airline id
		const airlineId = req.user._id;
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error fetching top business occupancy flights data' });
	}
};

// ------------------------------------------------------------------------------------------------
// Customer Analytics Functions
// ------------------------------------------------------------------------------------------------

/**
 * Get's the popular destinations for a customer
 * @param {*} req
 * @param {*} res
 * @returns {Object} popularDestinations
 */
const topDestinations = async (req, res) => {
	try {
		// cache key for top destinations
		const cacheKey = 'top_destinations';

		// try to get data from cache first
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return res.status(200).json(cachedData);
		}

		console.log('Cache miss for top destinations, querying database');

		// get popular destinations
		const popularDestinations = await Ticket.aggregate([
			{
				$facet: {
					departureFlights: [
						{ $match: { 'departureFlight._id': { $exists: true } } },
						{
							$group: {
								_id: '$departureFlight.arrivalAirport._id',
								name: { $first: '$departureFlight.arrivalAirport.city' },
								image: { $first: '$departureFlight.arrivalAirport.image' },
								count: { $sum: 1 },
							},
						},
					],
					returnFlights: [
						{ $match: { 'returnFlight._id': { $exists: true } } },
						{
							$group: {
								_id: '$returnFlight.arrivalAirport._id',
								name: { $first: '$returnFlight.arrivalAirport.city' },
								image: { $first: '$returnFlight.arrivalAirport.image' },
								count: { $sum: 1 },
							},
						},
					],
				},
			},

			{
				$project: {
					allDestinations: {
						$concatArrays: ['$departureFlights', '$returnFlights'],
					},
				},
			},
			{ $unwind: '$allDestinations' },
			{
				$group: {
					_id: '$allDestinations._id',
					name: { $first: '$allDestinations.name' },
					image: { $first: '$allDestinations.image' },
					count: { $sum: '$allDestinations.count' },
				},
			},

			{ $sort: { count: -1 } },

			{ $limit: 4 },

			{
				$project: {
					_id: 1,
					name: 1,
					image: 1,
				},
			},
		]);

		// store the results in redis cache for 2 minutes (120 seconds)
		await setCache(cacheKey, popularDestinations, 120);

		// return popular destinations
		res.status(200).json(popularDestinations);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export {
	topDepartureTimes,
	topAirlinesByNumberOfFlights,
	topCitiesByNumberOfFlights,
	topPlanesByNumberOfFlights,
	topRoutesByNumberOfFlights,
	topTravelClassByOccupancy,
	profitableEconomyFlights,
	profitableBusinessFlights,
	topDatesByNumberOfFlights,
	flightByDuration,
	topDestinations,
	topEconomyOccupancyFlights,
	topBusinessOccupancyFlights,
};