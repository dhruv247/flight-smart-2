import { Plane } from '../models/plane.model.js';
import { User } from '../models/user.model.js';
import { Flight } from '../models/flight.model.js';
import { Airport } from '../models/airport.model.js';
import { createSeats } from '../utils/seatUtils.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * create new flights
 * @param {*} req
 * @param {*} res
 */
const createFlight = async (req, res) => {
	try {
		// destructure req body
		const {
			flightNo,
			planeName,
			departureAirportName,
			departureDateTime,
			arrivalAirportName,
			arrivalDateTime,
			economyBasePrice,
			businessBasePrice,
		} = req.body;

		// validate departure datetime
		const departureDate = new Date(departureDateTime);
		if (isNaN(departureDate.getTime())) {
			return res.status(400).json({
				message: 'Invalid departure date and time format',
			});
		}

		// validate arrival datetime
		const arrivalDate = new Date(arrivalDateTime);
		if (isNaN(arrivalDate.getTime())) {
			return res.status(400).json({
				message: 'Invalid arrival date and time format',
			});
		}

		// convert prices to numbers
		const economyPrice = Number(economyBasePrice);
		const businessPrice = Number(businessBasePrice);

		// validate economy base price
		if (isNaN(economyPrice) || economyPrice < 1000 || economyPrice > 10000) {
			return res.status(400).json({
				message: 'Economy base price must be a number between ₹1000 and ₹10000',
			});
		}

		// validate business base price
		if (isNaN(businessPrice) || businessPrice < 3000 || businessPrice > 30000) {
			return res.status(400).json({
				message:
					'Business base price must be a number between ₹3000 and ₹30000',
			});
		}

		// validate business price is not less than economy price
		if (businessPrice <= economyPrice) {
			return res.status(400).json({
				message: 'Business base price must be greater than economy base price',
				details: {
					economyPrice,
					businessPrice,
				},
			});
		}

		// validate departure and arrival cities are different
		if (departureAirportName === arrivalAirportName) {
			return res.status(400).json({
				message: 'Departure and arrival cities must be different',
			});
		}

		// check if both cities exist in the database
		const [departureAirport, arrivalAirport] = await Promise.all([
			Airport.findOne({ airportName: departureAirportName }),
			Airport.findOne({ airportName: arrivalAirportName }),
		]);

		if (!departureAirport) {
			return res.status(400).json({
				message: 'Departure airport not found in our database',
			});
		}

		if (!arrivalAirport) {
			return res.status(400).json({
				message: 'Arrival airport not found in our database',
			});
		}

		// get current date without time
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		// validate departure date is today or later
		if (departureDate < currentDate) {
			return res.status(400).json({
				message: 'Departure date must be today or later',
			});
		}

		// validate arrival date is today or later
		if (arrivalDate < currentDate) {
			return res.status(400).json({
				message: 'Arrival date must be today or later',
			});
		}

		// validate all fields are present
		if (
			!flightNo ||
			!planeName ||
			!departureAirportName ||
			!departureDateTime ||
			!arrivalAirportName ||
			!arrivalDateTime ||
			!economyBasePrice ||
			!businessBasePrice
		) {
			return res.status(400).json({
				message: 'All fields are required',
			});
		}

		// get plane details
		const plane = await Plane.findOne({ planeName });

		// validate plane exists
		if (!plane) {
			return res.status(400).json({
				message: 'Please choose a valid plane',
			});
		}

		// get airline details
		const airlineId = req.user._id;
		const airline = await User.findById(airlineId);

		// validate airline exists
		if (!airline) {
			return res.status(400).json({
				message: 'Airline not found',
			});
		}

		// validate flight number format
		const airlinePrefix = airline.username.substring(0, 2).toUpperCase();
		const flightNoRegex = new RegExp(`^${airlinePrefix}\\d{4}$`);

		// validate flight number format
		if (!flightNoRegex.test(flightNo)) {
			return res.status(400).json({
				message: `Flight number must start with ${airlinePrefix} followed by 4 digits (e.g., ${airlinePrefix}9020)`,
			});
		}

		// get plane details
		const planeDetails = {
			_id: plane._id,
			planeName: plane.planeName,
			economyCapacity: plane.economyCapacity,
			businessCapacity: plane.businessCapacity,
		};

		// get airline details
		const airlineDetails = {
			_id: airline._id,
			airlineName: airline.username,
		};

		// validate arrival is at least 1 hour after departure
		if (arrivalDate <= departureDate) {
			return res.status(400).json({
				message: 'Arrival time must be at least 1 hour after departure time',
			});
		}

		// calculate duration in minutes
		const duration = Math.round((arrivalDate - departureDate) / (1000 * 60));

		// validate minimum duration of 1 hour (60 minutes)
		if (duration < 60) {
			return res.status(400).json({
				message: 'Flight duration must be at least 1 hour (60 minutes)',
			});
		}

		// validate maximum duration of 4 hours (240 minutes)
		if (duration > 240) {
			return res.status(400).json({
				message: 'Flight duration cannot exceed 4 hours (240 minutes)',
			});
		}

		// create flight
		const flight = new Flight({
			flightNo,
			airline: airlineDetails,
			plane: planeDetails,
			departureAirport,
			departureDateTime,
			arrivalAirport,
			arrivalDateTime,
			duration,
			economyBasePrice,
			businessBasePrice,
			economyCurrentPrice: economyBasePrice,
			businessCurrentPrice: businessBasePrice,
		});

		const savedFlight = await flight.save();

		// create seats for the flight using plane's capacity
		await createSeats(savedFlight, plane);

		// return success message
		return res.status(201).json({
			message: 'Flight created successfully',
			flight: savedFlight,
		});
	} catch (error) {
		// handle duplicate flight number error
		if (error.code === 11000) {
			return res.status(400).json({
				message: `An identical flight number already exists. Please use a different flight number.`,
			});
		}

		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * search for flights using aggregation
 * @param {*} req
 * @param {*} res
 */
const searchFlights = async (req, res) => {
	try {
		const {
			flightFrom,
			flightTo,
			departureDate,
			returnDate,
			travelClass,
			passengers,
			page = 0,
			size = 10,
			departureFlightArrivalTime
		} = req.body;

		// validate required fields
		if (
			!flightFrom ||
			!flightTo ||
			!departureDate ||
			!travelClass ||
			!passengers
		) {
			return res.status(400).json({
				message: 'All fields are required',
				details: {
					missingFields: {
						flightFrom: !flightFrom,
						flightTo: !flightTo,
						departureDate: !departureDate,
						travelClass: !travelClass,
						passengers: !passengers,
					},
				},
			});
		}

		// validate date is not in the past
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const searchDate = new Date(departureDate);
		searchDate.setHours(0, 0, 0, 0);

		if (searchDate < today) {
			return res.status(400).json({
				message: 'Cannot search for flights in the past',
				details: {
					searchDate,
					today,
				},
			});
		}

		// validate departure and arrival airports are different
		if (flightFrom === flightTo) {
			return res.status(400).json({
				message: 'Departure and arrival airports must be different',
			});
		}

		// validate passenger count
		const passengerCount = parseInt(passengers);
		if (isNaN(passengerCount) || passengerCount < 1 || passengerCount > 9) {
			return res.status(400).json({
				message: 'Passenger count must be between 1 and 5',
				details: {
					passengerCount,
				},
			});
		}

		// Find departure and arrival airports
		const [departureAirport, arrivalAirport] = await Promise.all([
			Airport.findOne({ city: flightFrom }),
			Airport.findOne({ city: flightTo }),
		]);

		if (!departureAirport) {
			return res.status(400).json({
				message: 'Departure place not found',
			});
		}

		if (!arrivalAirport) {
			return res.status(400).json({
				message: 'Arrival place not found',
			});
		}

		// Convert travelClass to string for comparison
		const travelClassStr = String(travelClass);

		// match stage for departure flights with seat availability check
		const departureMatchStage = {
			$match: {
				'departureAirport._id': departureAirport._id,
				'arrivalAirport._id': arrivalAirport._id,
				departureDateTime: {
					$gte: new Date(departureDate),
					$lt: new Date(
						new Date(departureDate).setDate(
							new Date(departureDate).getDate() + 1
						)
					),
				},
				$expr: {
					$and: [
						{
							$cond: {
								if: { $eq: [travelClassStr, '1'] }, // economy class
								then: {
									$gte: [
										{
											$subtract: [
												'$plane.economyCapacity',
												'$economyBookedCount',
											],
										},
										passengerCount,
									],
								},
								else: {
									$gte: [
										{
											$subtract: [
												'$plane.businessCapacity',
												'$businessBookedCount',
											],
										},
										passengerCount,
									],
								},
							},
						},
						{
							$or: [
								// If not same day, allow all flights
								{
									$ne: [
										{
											$dateToString: {
												format: '%Y-%m-%d',
												date: '$departureDateTime',
											},
										},
										{ $dateToString: { format: '%Y-%m-%d', date: new Date() } },
									],
								},
								// If same day, only allow flights at least 6 hours from now
								{
									$and: [
										{
											$eq: [
												{
													$dateToString: {
														format: '%Y-%m-%d',
														date: '$departureDateTime',
													},
												},
												{
													$dateToString: {
														format: '%Y-%m-%d',
														date: new Date(),
													},
												},
											],
										},
										{
											$gte: [
												'$departureDateTime',
												{ $add: [new Date(), 1 * 60 * 60 * 1000] },
											],
										},
									],
								},
							],
						},
					],
				},
			},
		};

		// Add debug logging stage
		const debugStage = {
			$addFields: {
				availableEconomySeats: {
					$subtract: ['$plane.economyCapacity', '$economyBookedCount'],
				},
				availableBusinessSeats: {
					$subtract: ['$plane.businessCapacity', '$businessBookedCount'],
				},
			},
		};

		// sort stage (separate so that it can be removed easily in case best flight is written)
		const economySortStage = [
			{
				$addFields: {
					totalPrice: {
						$add: ['$economyCurrentPrice', '$duration'],
					},
				},
			},
			{
				$sort: {
					totalPrice: 1,
				},
			},
		];

		const businessSortStage = [
			{
				$addFields: {
					totalPrice: {
						$add: ['$businessCurrentPrice', '$duration'],
					},
				},
			},
			{
				$sort: {
					totalPrice: 1,
				},
			},
		];

		let sortStage;

		if (travelClassStr === '1') {
			sortStage = economySortStage;
		} else {
			sortStage = businessSortStage;
		}

		// Add a debug log
		console.log('Search Parameters:', {
			flightFrom,
			flightTo,
			departureDate,
			travelClass: travelClassStr,
			passengers: passengerCount,
		});

		// get departure flights using aggregation
		const departureFlights = await Flight.aggregate([
			departureMatchStage,
			debugStage,
			...sortStage,
			{ $skip: page * size },
			{ $limit: size },
		]);

		// Get total count of matching flights
		const totalDepartureFlights = await Flight.aggregate([
			departureMatchStage,
			{ $count: 'total' },
		]);

		const totalPages = Math.ceil((totalDepartureFlights[0]?.total || 0) / size);

		// Add debug log for results
		console.log('Found departure flights:', departureFlights.length);
		console.log(
			'Flight details:',
			departureFlights.map((flight) => ({
				flightNo: flight.flightNo,
				availableEconomySeats: flight.availableEconomySeats,
				availableBusinessSeats: flight.availableBusinessSeats,
				requestedSeats: passengerCount,
				travelClass: travelClassStr,
			}))
		);

		// if return date is provided, validate and search for return flights
		let returnFlights = [];
		let totalReturnPages = 0;
		if (returnDate) {
			const returnSearchDate = new Date(returnDate);
			returnSearchDate.setHours(0, 0, 0, 0);

			if (returnSearchDate < today) {
				return res.status(400).json({
					message: 'Cannot search for return flights in the past',
					details: {
						returnDate,
						today,
					},
				});
			}

			if (returnSearchDate < searchDate) {
				return res.status(400).json({
					message: 'Return date cannot be before departure date',
					details: {
						departureDate,
						returnDate,
					},
				});
			}

			// calculate minimum return date (next day)
			const minReturnDate = new Date(departureDate);
			minReturnDate.setDate(minReturnDate.getDate() + 1);
			const minReturnDateStr = minReturnDate.toISOString().split('T')[0];

			const returnMatchStage = {
				$match: {
					'departureAirport._id': arrivalAirport._id,
					'arrivalAirport._id': departureAirport._id,
					departureDateTime: {
						$gte: new Date(
							new Date(departureFlightArrivalTime).setHours(
								new Date(departureFlightArrivalTime).getHours() + 1
							)
						),
						$lt: new Date(
							new Date(returnDate).setDate(new Date(returnDate).getDate() + 1)
						),
					},
					$expr: {
						$cond: {
							if: { $eq: [travelClassStr, '1'] }, // economy class
							then: {
								$gte: [
									{
										$subtract: [
											'$plane.economyCapacity',
											'$economyBookedCount',
										],
									},
									passengerCount,
								],
							},
							else: {
								$gte: [
									{
										$subtract: [
											'$plane.businessCapacity',
											'$businessBookedCount',
										],
									},
									passengerCount,
								],
							},
						},
					},
				},
			};

			returnFlights = await Flight.aggregate([
				returnMatchStage,
				debugStage,
				...sortStage,
				{ $skip: page * size },
				{ $limit: size },
			]);

			// Get total count of matching return flights
			const totalReturnFlights = await Flight.aggregate([
				returnMatchStage,
				{ $count: 'total' },
			]);

			totalReturnPages = Math.ceil((totalReturnFlights[0]?.total || 0) / size);

			console.log('Found return flights:', returnFlights.length);
			console.log(
				'Return flight details:',
				returnFlights.map((flight) => ({
					flightNo: flight.flightNo,
					availableEconomySeats: flight.availableEconomySeats,
					availableBusinessSeats: flight.availableBusinessSeats,
					requestedSeats: passengerCount,
					travelClass: travelClassStr,
				}))
			);

			if (returnFlights.length === 0) {
				if (departureFlights.length === 0) {
					return res.status(200).json({
						message: 'No departure flights available for this round trip',
						departureFlights: [],
						returnFlights: [],
					});
				} else {
					return res.status(200).json({
						message: 'No return flights available for this route',
						departureFlights: [],
					});
				}
			}
		}

		return res.status(200).json({
			message: 'Flights retrieved successfully',
			departureFlights,
			returnFlights: returnFlights || [],
			totalPages,
			totalReturnPages,
			currentPage: page,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * update the price of a flight
 * @param {*} req
 * @param {*} res
 */
const updateFlightPrice = async (req, res) => {
	try {
		// destructure req params
		const flightId = req.params.id;

		// get flight
		const flight = await Flight.findById(flightId);

		// validate flight exists
		if (!flight) {
			return res.status(404).json({
				message: 'Flight not found',
			});
		}

		// calculate new economy current price
		const newEconomyCurrentPrice = Math.round(
			(flight.economyBookedCount / flight.plane.economyCapacity) *
				flight.economyBasePrice +
				flight.economyBasePrice
		);

		// calculate new business current price
		const newBusinessCurrentPrice = Math.round(
			(flight.businessBookedCount / flight.plane.businessCapacity) *
				flight.businessBasePrice +
				flight.businessBasePrice
		);

		// update flight price
		await Flight.findByIdAndUpdate(flightId, {
			economyCurrentPrice: newEconomyCurrentPrice,
			businessCurrentPrice: newBusinessCurrentPrice,
		});

		// return success message
		return res.status(200).json({
			message: 'Flight price updated successfully',
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * get flight by id
 * @param {*} req
 * @param {*} res
 */
const getFlightById = async (req, res) => {
	try {
		// destructure req params
		const flightId = req.params.id;

		// get flight
		const flight = await Flight.findById(flightId);

		// validate flight exists
		if (!flight) {
			return res.status(404).json({
				message: 'Flight not found',
			});
		}

		// return success message
		return res.status(200).json({
			message: 'Flight retrieved successfully',
			flight,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * get all flights for an airline
 * @param {*} req
 * @param {*} res
 */
const getAllFlightsForAirline = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const page = parseInt(req.query.page) || 0;
		const size = parseInt(req.query.size) || 10;

		// Get total count of flights for this airline
		const totalFlights = await Flight.countDocuments({
			'airline._id': airlineId,
		});
		const totalPages = Math.ceil(totalFlights / size);

		const flights = await Flight.find({ 'airline._id': airlineId })
			.skip(page * size)
			.limit(size);

		// return success message
		return res.status(200).json({
			message: 'Flights retrieved successfully',
			flights,
			totalPages,
			totalFlights,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * search for flights for an airline
 * @param {*} req
 * @param {*} res
 */
const searchFlightsForAirline = async (req, res) => {
	const airlineId = req.user._id;

	try {
		const { flightNo, flightFrom, flightTo, departureDate } = req.query;

		// Get pagination parameters
		const page = parseInt(req.query.page) || 0;
		const size = parseInt(req.query.size) || 10;

		const matchCriteria = {
			'airline._id': airlineId,
		};

		if (flightNo) {
			matchCriteria.flightNo = flightNo;
		}

		if (flightFrom) {
			matchCriteria['departureAirport.city'] = flightFrom;
		}

		if (flightTo) {
			matchCriteria['arrivalAirport.city'] = flightTo;
		}

		if (departureDate) {
			matchCriteria.departureDateTime = {
				$gte: new Date(departureDate),
				$lt: new Date(
					new Date(departureDate).setDate(new Date(departureDate).getDate() + 1)
				),
			};
		}

		// Get total count of matching flights
		const total = await Flight.countDocuments(matchCriteria);

		// Use find() instead of aggregate for simpler querying
		const flights = await Flight.find(matchCriteria)
			.skip(page * size)
			.limit(size)
			.sort({ createdAt: -1 }); // Sort by departure date and time

		return res.status(200).json({
			message: 'Flights retrieved successfully',
			flights,
			total,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

export {
	createFlight,
	searchFlights,
	updateFlightPrice,
	getFlightById,
	getAllFlightsForAirline,
	searchFlightsForAirline,
};
