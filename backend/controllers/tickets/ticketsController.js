const Ticket = require('../../models/Ticket');
const Flight = require('../../models/Flight');
const User = require('../../models/User');
const Seat = require('../../models/Seat');
const mongoose = require('mongoose');

// Helper function to validate date of birth
const isValidDateOfBirth = (dob) => {
	const dobDate = new Date(dob);
	const today = new Date();

	// Check if date is not in the future
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
 * @description
 * 1. Get's the data for creating a ticket from the requests' body
 * 2. check's mandatory fields
 * 3. get's the departure and return flights and seats
 * 4. calculatees ticket price
 * 5. starts session
 */
exports.create = async (req, res) => {
	try {
		const {
			departureFlightId,
			returnFlightId,
			nameOfFlyer,
			dateOfBirth,
			seatType,
			departureFlightSeatNumber,
			returnFlightSeatNumber,
			identificationDocument,
		} = req.body;

		if (
			!departureFlightId ||
			!nameOfFlyer ||
			!dateOfBirth ||
			!seatType ||
			!departureFlightSeatNumber ||
			!identificationDocument
		) {
			return res.status(400).json({
				message: 'Please give all the mandatory fields!',
			});
		}

		// Validate date of birth
		const dobValidation = isValidDateOfBirth(dateOfBirth);
		if (!dobValidation.isValid) {
			return res.status(400).json({
				message: dobValidation.message,
			});
		}

		const departureFlight = await Flight.findById(departureFlightId);
		if (!departureFlight) {
			return res.status(404).json({
				message: 'Departure flight not found',
			});
		}

		const departureFlightDetails = {
			_id: departureFlightId,
			flightNo: departureFlight.flightNo,
			airline: departureFlight.airlineDetails.airlineName,
			plane: departureFlight.planeDetails.planeName,
			departurePlace: departureFlight.departurePlace,
			departureDate: departureFlight.departureDate,
			departureTime: departureFlight.departureTime,
			arrivalPlace: departureFlight.arrivalPlace,
			arrivalDate: departureFlight.arrivalDate,
			arrivalTime: departureFlight.arrivalTime,
			duration: departureFlight.duration,
		}

		// Find and check departure seat
		const departureSeat = await Seat.findOne({
			flight: departureFlightId,
			seatNumber: departureFlightSeatNumber,
			seatType: seatType,
		});

		if (!departureSeat) {
			return res.status(404).json({
				message: 'Selected departure seat not found',
			});
		}

		if (departureSeat.occupied) {
			return res.status(400).json({
				message: 'Selected departure seat is already occupied',
			});
		}

		let returnFlight = null;
		let returnSeat = null;
		let roundTrip = false;

		let returnFlightDetails = null;

		if (returnFlightId && returnFlightSeatNumber) {
			returnFlight = await Flight.findById(returnFlightId);
			if (!returnFlight) {
				return res.status(404).json({
					message: 'Return flight not found',
				});
			}

			returnFlightDetails = {
				_id: returnFlightId,
				flightNo: returnFlight.flightNo,
				airline: returnFlight.airlineDetails.airlineName,
				plane: returnFlight.planeDetails.planeName,
				departurePlace: returnFlight.departurePlace,
				departureDate: returnFlight.departureDate,
				departureTime: returnFlight.departureTime,
				arrivalPlace: returnFlight.arrivalPlace,
				arrivalDate: returnFlight.arrivalDate,
				arrivalTime: returnFlight.arrivalTime,
				duration: returnFlight.duration,
			}
			// Find and check return seat
			returnSeat = await Seat.findOne({
				flight: returnFlightId,
				seatNumber: returnFlightSeatNumber,
				seatType: seatType,
			});

			if (!returnSeat) {
				return res.status(404).json({
					message: 'Selected return seat not found',
				});
			}

			if (returnSeat.occupied) {
				return res.status(400).json({
					message: 'Selected return seat is already occupied',
				});
			}

			roundTrip = true;
		}

		const user = await User.findById(req.user._id);

		const userDetails = {
			_id: user._id,
			email: user.email,
			username: user.username,
		};

		// Calculate ticket price
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

		// Start a session for transaction (because we are updating multiple documents)
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Create the ticket
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
				identificationDocument,
			});

			// Update seat statuses
			departureSeat.occupied = true;
			if (returnSeat) {
				returnSeat.occupied = true;
			}

			// Save all changes in a transaction
			await ticket.save({ session });
			await departureSeat.save({ session });
			if (returnSeat) {
				await returnSeat.save({ session });
			}

			// Update flight booked counts
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
			// Throw this error for the outer try catch block if transaction fails
			throw error;
		} finally {
			session.endSession();
		}
	} catch (error) {
		// console.error('Error creating ticket', error);
		return res.status(500).json({
			message: 'Error creating ticket',
			error: error.message,
		});
	}
};

exports.getTicketById = async (req, res) => {
	try {
		const { id } = req.params;
		const ticket = await Ticket.findById(id);
		return res.status(200).json({ ticket });
	} catch (error) {
		return res.status(500).json({
			message: 'Error getting ticket by id',
			error: error.message,
		});
	}
};