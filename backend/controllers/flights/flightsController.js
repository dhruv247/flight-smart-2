const Plane = require('../../models/Plane');
const User = require('../../models/User');
require('dotenv').config();
const Flight = require('../../models/Flight');
const createSeats = require('../../utils/createSeats');
const City = require('../../models/City');

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDate = (dateStr) => {
	const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
	if (!dateRegex.test(dateStr)) return false;

	// convert each part to number
	const [year, month, day] = dateStr.split('-').map(Number);
	// create a new date object (month is 0-indexed)
	const date = new Date(year, month - 1, day);
	// check if the date is valid
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
};

/**
 * Validates if a string is a valid time in 24-hour format (0000-2359)
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidTime = (timeStr) => {
	const timeRegex = /^([01][0-9]|2[0-3])[0-5][0-9]$/;
	return timeRegex.test(timeStr);
};

/**
 * utility function to format time
 * @param {*} timeStr - time in a format 1440
 * @returns format 14:40
 */
const formatTimeForDate = (timeStr) => {
	const hours = timeStr.substring(0, 2);
	const minutes = timeStr.substring(2);
	return `${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		// pad with 0 if less than 2 digits
		.padStart(2, '0')}`;
};

/**
 * create new flights
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get plane details
 * 2. get airline details
 * 3. calculate duration
 * 4. create seats for flight according to plane
 * 5. create flight
 */
exports.create = async (req, res) => {
	try {
		const {
			flightNo,
			planeName,
			departurePlace,
			departureDate,
			departureTime,
			arrivalPlace,
			arrivalDate,
			arrivalTime,
			economyBasePrice,
			businessBasePrice,
		} = req.body;

		// Validate departure date format
		if (!isValidDate(departureDate)) {
			return res.status(400).json({
				message:
					'Invalid departure date format. Must be in YYYY-MM-DD format (e.g., 2025-05-09)',
			});
		}

		// Validate arrival date format
		if (!isValidDate(arrivalDate)) {
			return res.status(400).json({
				message:
					'Invalid arrival date format. Must be in YYYY-MM-DD format (e.g., 2025-05-09)',
			});
		}

		// Validate departure time format
		if (!isValidTime(departureTime)) {
			return res.status(400).json({
				message:
					'Invalid departure time format. Must be in 24-hour format (0000-2359)',
			});
		}

		// Validate arrival time format
		if (!isValidTime(arrivalTime)) {
			return res.status(400).json({
				message:
					'Invalid arrival time format. Must be in 24-hour format (0000-2359)',
			});
		}

		// Convert prices to numbers
		const economyPrice = Number(economyBasePrice);
		const businessPrice = Number(businessBasePrice);

		// Validate economy base price
		if (isNaN(economyPrice) || economyPrice < 1000 || economyPrice > 10000) {
			return res.status(400).json({
				message: 'Economy base price must be a number between ₹1000 and ₹10000',
			});
		}

		// Validate business base price
		if (isNaN(businessPrice) || businessPrice < 3000 || businessPrice > 30000) {
			return res.status(400).json({
				message:
					'Business base price must be a number between ₹3000 and ₹30000',
			});
		}

		// Validate business price is not less than economy price
		if (businessPrice <= economyPrice) {
			return res.status(400).json({
				message: 'Business base price must be greater than economy base price',
				details: {
					economyPrice,
					businessPrice,
				},
			});
		}

		// Validate departure and arrival cities are different
		if (departurePlace === arrivalPlace) {
			return res.status(400).json({
				message: 'Departure and arrival cities must be different',
			});
		}

		// Check if both cities exist in the database
		const [departureCity, arrivalCity] = await Promise.all([
			City.findOne({ name: departurePlace }),
			City.findOne({ name: arrivalPlace }),
		]);

		if (!departureCity) {
			return res.status(400).json({
				message: 'Departure city not found in our database',
			});
		}

		if (!arrivalCity) {
			return res.status(400).json({
				message: 'Arrival city not found in our database',
			});
		}

		// Get current date without time
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		// Convert departure and arrival dates to Date objects
		const departureDateObj = new Date(departureDate);
		const arrivalDateObj = new Date(arrivalDate);

		// Validate departure date is today or later
		if (departureDateObj < currentDate) {
			return res.status(400).json({
				message: 'Departure date must be today or later',
			});
		}

		// Validate arrival date is today or later
		if (arrivalDateObj < currentDate) {
			return res.status(400).json({
				message: 'Arrival date must be today or later',
			});
		}

		if (
			!flightNo ||
			!planeName ||
			!departurePlace ||
			!departureDate ||
			!departureTime ||
			!arrivalPlace ||
			!arrivalDate ||
			!arrivalTime ||
			!economyBasePrice ||
			!businessBasePrice
		) {
			return res.status(400).json({
				message: 'All fields are required',
			});
		}

		const plane = await Plane.findOne({ planeName });

		if (!plane) {
			return res.status(400).json({
				message: 'Please choose a valid plane',
			});
		}

		const airlineId = req.user._id;

		const airline = await User.findById(airlineId);

		if (!airline) {
			return res.status(400).json({
				message: 'Airline not found',
			});
		}

		// Validate flight number format
		const airlinePrefix = airline.username.substring(0, 2).toUpperCase();
		const flightNoRegex = new RegExp(`^${airlinePrefix}\\d{4}$`);

		if (!flightNoRegex.test(flightNo)) {
			return res.status(400).json({
				message: `Flight number must start with ${airlinePrefix} followed by 4 digits (e.g., ${airlinePrefix}9020)`,
			});
		}

		const planeDetails = {
			_id: plane._id,
			planeName: plane.planeName,
			economyCapacity: plane.economyCapacity,
			businessCapacity: plane.businessCapacity,
		};

		const airlineDetails = {
			_id: airline._id,
			airlineName: airline.username,
		};

		// Format departure time
		const formattedDepartureTime = formatTimeForDate(departureTime);
		// format for date time combination
		const departureDateTime = new Date(
			`${departureDate}T${formattedDepartureTime}`
		);

		// Format arrival time
		const formattedArrivalTime = formatTimeForDate(arrivalTime);
		const arrivalDateTime = new Date(`${arrivalDate}T${formattedArrivalTime}`);

		// Validate arrival is at least 1 hour after departure
		if (arrivalDateTime <= departureDateTime) {
			return res.status(400).json({
				message: 'Arrival time must be at least 1 hour after departure time',
			});
		}

		// Calculate duration in minutes
		const duration = Math.round(
			(arrivalDateTime - departureDateTime) / (1000 * 60)
		);

		// Validate minimum duration of 1 hour (60 minutes)
		if (duration < 60) {
			return res.status(400).json({
				message: 'Flight duration must be at least 1 hour (60 minutes)',
			});
		}

		// Validate maximum duration of 4 hours (240 minutes)
		if (duration > 240) {
			return res.status(400).json({
				message: 'Flight duration cannot exceed 4 hours (240 minutes)',
			});
		}

		const flight = new Flight({
			flightNo,
			airlineDetails,
			planeDetails,
			departurePlace,
			departureDate,
			departureTime,
			arrivalPlace,
			arrivalDate,
			arrivalTime,
			duration,
			economyBasePrice,
			businessBasePrice,
			economyCurrentPrice: economyBasePrice,
			businessCurrentPrice: businessBasePrice,
		});

		const savedFlight = await flight.save();

		// Create seats for the flight using plane's capacity
		await createSeats(savedFlight, plane);

		return res.status(201).json({
			message: 'Flight created successfully',
			flight: savedFlight,
		});
	} catch (error) {
		console.error('Error creating flight:', error);

		// Handle duplicate flight number error
		if (error.code === 11000) {
			return res.status(400).json({
				message: 'Flight number already exists',
				error: `An identical flight number already exists. Please use a different flight number.`,
			});
		}

		return res.status(500).json({
			message: 'Error creating flight',
			error: error.message,
		});
	}
};

/**
 * search for flights using aggregation
 * @param {*} req
 * @param {*} res
 * @description
 * 1. This function gets flghts using aggregation
 * 2. Currently we are searching flights all search fields except, travelClass and Passenger count which has to be added
 */
exports.search = async (req, res) => {
	try {
		const {
			flightFrom,
			flightTo,
			departureDate,
			returnDate,
			travelClass,
			passengers,
		} = req.body;

		// Validate required fields
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

		// Validate date is not in the past
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

		if (flightFrom === flightTo) {
			return res.status(400).json({
				message: 'Departure and arrival cities must be different',
			});
		}

		// Validate passenger count
		const passengerCount = parseInt(passengers);
		if (isNaN(passengerCount) || passengerCount < 1 || passengerCount > 5) {
			return res.status(400).json({
				message: 'Passenger count must be between 1 and 5',
				details: {
					passengerCount,
				},
			});
		}

		// match stage for departure flights with seat availability check
		const departureMatchStage = {
			$match: {
				departurePlace: flightFrom,
				arrivalPlace: flightTo,
				departureDate: departureDate,
				$expr: {
					$cond: {
						if: { $eq: [travelClass, '1'] }, // Economy class
						then: {
							$gte: [
								{
									$subtract: [
										'$planeDetails.economyCapacity',
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
										'$planeDetails.businessCapacity',
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

		// sort stage
		const sortStage = {
			$sort: {
				economyCurrentPrice: 1,
			},
		};

		// Get departure flights using aggregation
		const departureFlights = await Flight.aggregate([
			departureMatchStage,
			sortStage,
		]);

		// If return date is provided, validate and search for return flights
		let returnFlights = [];
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

			// Get the latest arrival time from departure flights
			const latestDepartureArrival = departureFlights.reduce(
				(latest, flight) => {
					const arrivalTime = new Date(
						`${flight.arrivalDate}T${flight.arrivalTime}`
					);
					return arrivalTime > latest ? arrivalTime : latest;
				},
				new Date(departureDate + 'T00:00:00')
			); // Start with the departure date at midnight

			// Calculate minimum return date (next day)
			const minReturnDate = new Date(departureDate);
			minReturnDate.setDate(minReturnDate.getDate() + 1);
			const minReturnDateStr = minReturnDate.toISOString().split('T')[0];

			const returnMatchStage = {
				$match: {
					departurePlace: flightTo,
					arrivalPlace: flightFrom,
					departureDate: { $gte: minReturnDateStr },
					$expr: {
						$cond: {
							if: { $eq: [travelClass, '1'] }, // Economy class
							then: {
								$gte: [
									{
										$subtract: [
											'$planeDetails.economyCapacity',
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
											'$planeDetails.businessCapacity',
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

			returnFlights = await Flight.aggregate([returnMatchStage, sortStage]);

			if (returnFlights.length === 0) {
				return res.status(400).json({
					message: 'No return flights available for the next day or later',
					details: {
						earliestReturnDate: minReturnDateStr,
					},
				});
			}
		}

		return res.status(200).json({
			message: 'Flights retrieved successfully',
			departureFlights,
			returnFlights,
		});
	} catch (error) {
		console.error('Error searching flights:', error);
		return res.status(500).json({
			message: 'Error searching flights',
			error: error.message,
		});
	}
};

/**
 * Update the price of a flight
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Update the price of a flight
 */
exports.updateFlightPrice = async (req, res) => {
	try {
		const flightId = req.params.id;
		const flight = await Flight.findById(flightId);

		if (!flight) {
			return res.status(404).json({
				message: 'Flight not found',
			});
		}

		const newEconomyCurrentPrice = Math.round(
			(flight.economyBookedCount / flight.planeDetails.economyCapacity) *
				flight.economyBasePrice +
				flight.economyBasePrice
		);
		const newBusinessCurrentPrice = Math.round(
			(flight.businessBookedCount / flight.planeDetails.businessCapacity) *
				flight.businessBasePrice +
				flight.businessBasePrice
		);

		await Flight.findByIdAndUpdate(flightId, {
			economyCurrentPrice: newEconomyCurrentPrice,
			businessCurrentPrice: newBusinessCurrentPrice,
		});

		res.json({
			message: 'Flight price updated successfully',
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error updating flight price',
			error: error.message,
		});
	}
};

/**
 * Get flight by id
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get flight by id
 */
exports.getFlightById = async (req, res) => {
	try {
		const flightId = req.params.id;
		const flight = await Flight.findById(flightId);

		if (!flight) {
			return res.status(404).json({
				message: 'Flight not found',
			});
		}

		res.json({
			message: 'Flight retrieved successfully',
			flight,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error retrieving flight',
			error: error.message,
		});
	}
};

/**
 * Get all flights for an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get all flights for an airline
 */
exports.getAllFlightsForAirline = async (req, res) => {
	try {
		const airlineId = req.user._id;
		const page = parseInt(req.query.page) || 0;
		const size = parseInt(req.query.size) || 10;
		const flights = await Flight.find({ 'airlineDetails._id': airlineId })
			.skip(page * size)
			.limit(size);
		res.json({
			message: 'Flights retrieved successfully',
			flights,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Error retrieving flights',
			error: error.message,
		});
	}
};
