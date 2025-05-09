import { Plane } from '../models/plane.model.js';
import { User } from '../models/user.model.js';
import { Flight } from '../models/flight.model.js';
import { City } from '../models/city.model.js';
import { createSeats } from '../utils/seatUtils.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDate = (dateStr) => {
	const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
	if (!dateRegex.test(dateStr)) return false;

	return true;

	// // convert each part to number
	// const [year, month, day] = dateStr.split('-').map(Number);
	// // create a new date object (month is 0-indexed)
	// const date = new Date(year, month - 1, day);
	// // check if the date is valid
	// return (
	// 	date.getFullYear() === year &&
	// 	date.getMonth() === month - 1 &&
	// 	date.getDate() === day
	// );
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
 */
const createFlight = async (req, res) => {
	try {
		// destructure req body
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

		// validate departure date format
		if (!isValidDate(departureDate)) {
			return res.status(400).json({
				message:
					'Invalid departure date format. Must be in YYYY-MM-DD format (e.g., 2025-05-09)',
			});
		}

		// validate arrival date format
		if (!isValidDate(arrivalDate)) {
			return res.status(400).json({
				message:
					'Invalid arrival date format. Must be in YYYY-MM-DD format (e.g., 2025-05-09)',
			});
		}

		// validate departure time format
		if (!isValidTime(departureTime)) {
			return res.status(400).json({
				message:
					'Invalid departure time format. Must be in 24-hour format (0000-2359)',
			});
		}

		// validate arrival time format
		if (!isValidTime(arrivalTime)) {
			return res.status(400).json({
				message:
					'Invalid arrival time format. Must be in 24-hour format (0000-2359)',
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
		if (departurePlace === arrivalPlace) {
			return res.status(400).json({
				message: 'Departure and arrival cities must be different',
			});
		}

		// check if both cities exist in the database
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

		// get current date without time
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		// convert departure and arrival dates to Date objects
		const departureDateObj = new Date(departureDate);
		const arrivalDateObj = new Date(arrivalDate);

		// validate departure date is today or later
		if (departureDateObj < currentDate) {
			return res.status(400).json({
				message: 'Departure date must be today or later',
			});
		}

		// validate arrival date is today or later
		if (arrivalDateObj < currentDate) {
			return res.status(400).json({
				message: 'Arrival date must be today or later',
			});
		}

		// validate all fields are present
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

		// format departure time
		const formattedDepartureTime = formatTimeForDate(departureTime);
		// format for date time combination
		const departureDateTime = new Date(
			`${departureDate}T${formattedDepartureTime}`
		);

		// format arrival time
		const formattedArrivalTime = formatTimeForDate(arrivalTime);
		const arrivalDateTime = new Date(`${arrivalDate}T${formattedArrivalTime}`);

		// validate arrival is at least 1 hour after departure
		if (arrivalDateTime <= departureDateTime) {
			return res.status(400).json({
				message: 'Arrival time must be at least 1 hour after departure time',
			});
		}

		// calculate duration in minutes
		const duration = Math.round(
			(arrivalDateTime - departureDateTime) / (1000 * 60)
		);

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

		if (flightFrom === flightTo) {
			return res.status(400).json({
				message: 'Departure and arrival cities must be different',
			});
		}

		// validate passenger count
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
						if: { $eq: [travelClass, '1'] }, // economy class
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

		// get departure flights using aggregation
		const departureFlights = await Flight.aggregate([
			departureMatchStage,
			sortStage,
		]);

		// if return date is provided, validate and search for return flights
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

			// get the latest arrival time from departure flights
			const latestDepartureArrival = departureFlights.reduce(
				(latest, flight) => {
					const arrivalTime = new Date(
						`${flight.arrivalDate}T${flight.arrivalTime}`
					);
					return arrivalTime > latest ? arrivalTime : latest;
				},
				new Date(departureDate + 'T00:00:00')
			); // start with the departure date at midnight

			// calculate minimum return date (next day)
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
							if: { $eq: [travelClass, '1'] }, // economy class
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
			(flight.economyBookedCount / flight.planeDetails.economyCapacity) *
				flight.economyBasePrice +
				flight.economyBasePrice
		);

		// calculate new business current price
		const newBusinessCurrentPrice = Math.round(
			(flight.businessBookedCount / flight.planeDetails.businessCapacity) *
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
		const flights = await Flight.find({ 'airlineDetails._id': airlineId })
			.skip(page * size)
			.limit(size);

		// return success message
		return res.status(200).json({
			message: 'Flights retrieved successfully',
			flights,
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
};
