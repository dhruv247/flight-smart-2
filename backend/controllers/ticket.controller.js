import mongoose from 'mongoose';
import { Ticket } from '../models/ticket.model.js';
import { Flight } from '../models/flight.model.js';
import { User } from '../models/user.model.js';
import { Seat } from '../models/seat.model.js';

/**
 * Helper function to validate date of birth
 * @param {*} dob
 * @returns
 */
const isValidDateOfBirth = (dob) => {
	const dobDate = new Date(dob);
	const today = new Date();

	// check if date is not in the future
	if (dobDate > today) {
		return { isValid: false, message: 'Date of birth cannot be in the future' };
	}

	return { isValid: true };
};

/**
 * Creates new Tickets and updates a seat's occupied status
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createTicket = async (req, res) => {
	try {
		// destructure req body
		const {
			departureFlightId,
			returnFlightId,
			nameOfFlyer,
			dateOfBirth,
			seatType,
			departureFlightSeatNumber,
			returnFlightSeatNumber,
		} = req.body;

		// validate required fields
		if (
			!departureFlightId ||
			!nameOfFlyer ||
			!dateOfBirth ||
			!seatType ||
			!departureFlightSeatNumber
		) {
			return res.status(400).json({
				message: 'Please give all the mandatory fields!',
			});
		}

		// validate date of birth
		const dobValidation = isValidDateOfBirth(dateOfBirth);
		if (!dobValidation.isValid) {
			return res.status(400).json({
				message: dobValidation.message,
			});
		}

		// get departure flight
		const departureFlight = await Flight.findById(departureFlightId);

		// validate departure flight
		if (!departureFlight) {
			return res.status(404).json({
				message: 'Departure flight not found',
			});
		}

		// get departure flight details
		const departureFlightDetails = {
			_id: departureFlightId,
			flightNo: departureFlight.flightNo,
			airline: departureFlight.airline,
			plane: departureFlight.plane.planeName,
			departureAirport: departureFlight.departureAirport,
			departureDateTime: departureFlight.departureDateTime,
			arrivalAirport: departureFlight.arrivalAirport,
			arrivalDateTime: departureFlight.arrivalDateTime,
			duration: departureFlight.duration,
		};

		// find and check departure seat
		const departureSeat = await Seat.findOne({
			flight: departureFlightId,
			seatNumber: departureFlightSeatNumber,
			seatType: seatType,
		});

		// validate departure seat
		if (!departureSeat) {
			return res.status(404).json({
				message: 'Selected departure seat not found',
			});
		}

		// validate departure seat
		if (departureSeat.occupied) {
			return res.status(400).json({
				message: 'Selected departure seat is already occupied',
			});
		}

		// initialize return flight
		let returnFlight = null;

		// initialize return seat
		let returnSeat = null;

		// initialize round trip
		let roundTrip = false;

		// initialize return flight details
		let returnFlightDetails = null;

		// check if return flight and seat are provided
		if (returnFlightId && returnFlightSeatNumber) {
			// get return flight
			returnFlight = await Flight.findById(returnFlightId);

			// validate return flight
			if (!returnFlight) {
				return res.status(404).json({
					message: 'Return flight not found',
				});
			}

			// get return flight details
			returnFlightDetails = {
				_id: returnFlightId,
				flightNo: returnFlight.flightNo,
				airline: returnFlight.airline,
				plane: returnFlight.plane.planeName,
				departureAirport: returnFlight.departureAirport,
				departureDateTime: returnFlight.departureDateTime,
				arrivalAirport: returnFlight.arrivalAirport,
				arrivalDateTime: returnFlight.arrivalDateTime,
				duration: returnFlight.duration,
			};

			// find and check return seat
			returnSeat = await Seat.findOne({
				flight: returnFlightId,
				seatNumber: returnFlightSeatNumber,
				seatType: seatType,
			});

			// validate return seat
			if (!returnSeat) {
				return res.status(404).json({
					message: 'Selected return seat not found',
				});
			}

			// validate return seat
			if (returnSeat.occupied) {
				return res.status(400).json({
					message: 'Selected return seat is already occupied',
				});
			}

			// set round trip to true
			roundTrip = true;
		}

		// get user
		const user = await User.findById(req.user._id);

		// get user details
		const userDetails = {
			_id: user._id,
			email: user.email,
			username: user.username,
		};

		// calculate ticket price
		let ticketPrice = 0;
		if (seatType === 'economy') {
			ticketPrice = departureFlight.economyCurrentPrice;
			if (returnFlight) {
				ticketPrice += returnFlight.economyCurrentPrice;
			}
		} else {
			ticketPrice = departureFlight.businessCurrentPrice;
			if (returnFlight) {
				ticketPrice += returnFlight.businessCurrentPrice;
			}
		}

		// start a session for transaction (because we are updating multiple documents)
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// create the ticket
			const ticket = new Ticket({
				userDetails,
				departureFlight: departureFlightDetails,
				returnFlight: returnFlightDetails,
				nameOfFlyer,
				dateOfBirth: dateOfBirth.split('T')[0],
				roundTrip,
				seatType,
				departureFlightSeatNumber,
				returnFlightSeatNumber,
				ticketPrice,
			});

			// update seat statuses
			departureSeat.occupied = true;
			if (returnSeat) {
				returnSeat.occupied = true;
			}

			// save all changes in a transaction
			await ticket.save({ session });
			await departureSeat.save({ session });
			if (returnSeat) {
				await returnSeat.save({ session });
			}

			// update flight booked counts
			departureFlight[`${seatType}BookedCount`]++;
			await departureFlight.save({ session });

			if (returnFlight) {
				returnFlight[`${seatType}BookedCount`]++;
				await returnFlight.save({ session });
			}

			await session.commitTransaction();

			return res.status(201).json({
				message: 'Ticket created successfully',
				ticketId: ticket._id,
			});
		} catch (error) {
			await session.abortTransaction();
			// throw this error for the outer try catch block if transaction fails
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * Get ticket by id
 * @param {*} req
 * @param {*} res
 */
const getTicketById = async (req, res) => {
	try {
		// destructure req params
		const { id } = req.params;

		// get ticket
		const ticket = await Ticket.findById(id);

		// validate ticket
		if (!ticket) {
			return res.status(404).json({
				message: 'Ticket not found',
			});
		}
		// return ticket
		return res.status(200).json({ ticket });
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

export { createTicket, getTicketById };
