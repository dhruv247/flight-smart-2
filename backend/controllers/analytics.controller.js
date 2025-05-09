import mongoose from 'mongoose';
import { Booking } from '../models/booking.model.js';
import { Flight } from '../models/flight.model.js';
import { Ticket } from '../models/ticket.model.js';

// ------------------------------------------------------------------------------------------------
// Admin Analytics Functions
// ------------------------------------------------------------------------------------------------

/**
 * Get's the top departure flights by number of tickets
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Unwind the tickets array to work with individual tickets
 * 2. Group by departure flight details
 * 3. Sort by count in descending order
 * 4. Limit the number of flights
 * 5. Project the flight details
 */
const topDepartureFlightsByNumberOfTickets = async (req, res) => {
	try {
		
		const num = parseInt(req.query.num) || 5;

		const topFlights = await Booking.aggregate([
			
			{ $unwind: '$tickets' },
			
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
			
			{ $sort: { count: -1 } },

			{ $limit: num },

			{
				$project: {
					_id: 0,
					flightNo: 1,
					count: 1,
				},
			},
		]);

		res.status(200).json(topFlights);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top airlines by number of flights
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Group by airline details
 * 2. Sort by count in descending order
 * 3. Limit the number of airlines
 * 4. Project the airline details
 */
const topAirlinesByNumberOfFlights = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 5;

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

		res.status(200).json(topAirlines);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top cities by number of flights (only departure flights for now - change this in the future to also include return flights)
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Group by departure place
 * 2. Sort by count in descending order
 * 3. Limit the number of cities
 * 4. Project the city details
 */
const topCitiesByNumberOfFlights = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 5;

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

		res.status(200).json(topCities);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Get's the top planes by number of flights
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Group by plane details
 * 2. Sort by count in descending order
 * 3. Limit the number of planes
 * 4. Project the plane details
 */
const topPlanesByNumberOfFlights = async (req, res) => {
	try {
		const num = parseInt(req.query.num) || 5;

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

		res.status(200).json(topPlanes);
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
 * @description
 * 1. Calculates the profit score for each flight (economyCurrentPrice / duration)
 * 2. Sorts the flights by profit score in descending order
 * 3. Limits the number of flights
 * 4. Returns the top flights
 */
const profitableEconomyFlights = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const limit = parseInt(req.query.limit) || 5;

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
const profitableBusinessFlights = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const limit = parseInt(req.query.limit) || 5;

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
		res.status(500).json({ message: 'Error fetching profitable flights data' });
	}
};

/**
 * Get's the busiest dates for an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Group by departure date
 * 2. Sort by count in descending order
 * 3. Limit the number of dates
 * 4. Project the date details
 */
const topDatesByNumberOfFlights = async (req, res) => {
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
		res.status(500).json({ message: 'Error fetching busy dates data' });
	}
};

/**
 * Get's the number of flights by duration for an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Group by duration range
 * 2. Sort by count in descending order
 * 3. Project the duration range and count
 */
const flightByDuration = async (req, res) => {
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
		res.status(500).json({ message: 'Error fetching trip types data' });
	}
};

// ------------------------------------------------------------------------------------------------
// Customer Analytics Functions
// ------------------------------------------------------------------------------------------------

/**
 * Get's the popular destinations for a customer
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Group the tickets by departure and return flights
 * 2. Unwind both departure and return flights
 * 3. Then, group by arrival place
 * 4. Then, sort by count in descending order
 * 5. Then, lookup city details (doin this because images are not stored in the ticket model)
 * 6. Then, unwind city details
 * 7. Then, project only the city details
 */
const topDestinations = async (req, res) => {
	try {
		
		const popularDestinations = await Ticket.aggregate([
			{
				$facet: {
					departureFlights: [
						{ $match: { 'departureFlight._id': { $exists: true } } },
						{
							$group: {
								_id: '$departureFlight.arrivalPlace',
								count: { $sum: 1 },
							},
						},
					],
					returnFlights: [
						{ $match: { 'returnFlight._id': { $exists: true } } },
						{
							$group: { _id: '$returnFlight.arrivalPlace', count: { $sum: 1 } },
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
					count: { $sum: '$allDestinations.count' },
				},
			},

			{ $sort: { count: -1 } },

			{ $limit: 4 },

			{
				$lookup: {
					from: 'cities',
					localField: '_id',
					foreignField: 'name',
					as: 'cityDetails',
				},
			},

			{ $unwind: '$cityDetails' },

			{
				$project: {
					_id: '$cityDetails._id',
					name: '$cityDetails.name',
					image: '$cityDetails.image',
				},
			},
		]);

		res.status(200).json(popularDestinations);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export {
	topDepartureFlightsByNumberOfTickets,
	topAirlinesByNumberOfFlights,
	topCitiesByNumberOfFlights,
	topPlanesByNumberOfFlights,
	profitableEconomyFlights,
	profitableBusinessFlights,
	topDatesByNumberOfFlights,
	flightByDuration,
	topDestinations,
};