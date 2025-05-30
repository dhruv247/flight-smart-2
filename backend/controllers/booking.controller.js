import mongoose from 'mongoose';
import { Booking } from '../models/booking.model.js';
import { Ticket } from '../models/ticket.model.js';
import { User } from '../models/user.model.js';
import { Flight } from '../models/flight.model.js';
import { Seat } from '../models/seat.model.js';
import { sendToEmailQueue } from '../utils/sqsUtils.js';
import { sendBookingCancellationEmail } from '../utils/emailUtils.js';
import otpGenerator from 'otp-generator';

/**
 * Create booking from tickets
 * @param {*} req
 * @param {*} res
 */
const createBooking = async (req, res) => {
	try {
		// destructure req body
		const { tickets } = req.body;

		// find user by id
		const user = await User.findById(req.user._id);

		// if user is not found, throw error
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// get all tickets
		const ticketDetails = await Ticket.find({ _id: { $in: tickets } });

		// calculate booking price
		let bookingPrice = 0;

		// limited operations can be done using simple loop
		for (let ticket of ticketDetails) {
			bookingPrice += Number(ticket.ticketPrice);
		}

		// map ticket details to tickets array
		const ticketsArray = ticketDetails.map((ticket) => {
			return {
				_id: ticket._id,
				departureFlight: ticket.departureFlight,
				returnFlight: ticket.returnFlight,
				nameOfFlyer: ticket.nameOfFlyer,
				dateOfBirth: ticket.dateOfBirth,
				roundTrip: ticket.roundTrip,
				seatType: ticket.seatType,
				departureFlightSeatNumber: ticket.departureFlightSeatNumber,
				returnFlightSeatNumber: ticket.returnFlightSeatNumber,
				ticketPrice: ticket.ticketPrice,
			};
		});

		const userDetails = {
			_id: user._id,
			email: user.email,
			username: user.username,
		};

		const code = otpGenerator.generate(6, {
			upperCaseAlphabets: true,
			lowerCaseAlphabets: false,
			digits: true,
			specialChars: false,
		});

		const booking = new Booking({
			userDetails,
			tickets: ticketsArray,
			bookingPrice,
			pnr: code,
		});

		await booking.save();

		// Send booking confirmation email via SQS
		try {
			await sendToEmailQueue(booking);
		} catch (emailError) {
			// The booking is still successful even if email queuing fails (solves the past error)
			console.error('Error queuing confirmation email:', emailError);
		}

		return res.status(201).json({
			message: 'Booking saved successfully!',
		});
	} catch (error) {
		return res.status(500).json({
			message: "Failed to create booking. Please try again later.",
		});
	}
};

/**
 * Cancels a booking
 * @param {*} req
 * @param {*} res
 * @returns
 */
const cancelBooking = async (req, res) => {
	try {
		// destructure req params
		const bookingId = req.params.id;

		// get booking
		const booking = await Booking.findById(bookingId);

		// if booking is not found, throw error
		if (!booking) {
			return res.status(404).json({
				message: 'Booking not found',
			});
		}

		// Check if departure time is at least 24 hours away
		const departureTime = new Date(
			booking.tickets[0].departureFlight.departureDateTime
		);
		const currentTime = new Date();
		const hoursUntilDeparture =
			(departureTime - currentTime) / (1000 * 60 * 60);

		if (hoursUntilDeparture < 24) {
			return res.status(400).json({
				message:
					'Bookings can only be cancelled at least 24 hours before departure',
			});
		}

		// change booking status
		booking.confirmed = false;

		// save booking
		await booking.save();

		// get tickets
		const tickets = booking.tickets;

		// loop through tickets
		for (let ticket of tickets) {
			const departureFlightId = ticket.departureFlight._id;
			const departureFlightSeatNumber = ticket.departureFlightSeatNumber;

			const departureFlightSeat = await Seat.findOne({
				flight: departureFlightId,
				seatNumber: departureFlightSeatNumber,
			});

			if (departureFlightSeat) {
				departureFlightSeat.occupied = false;
				await departureFlightSeat.save();
			}

			// only process return flight if it's a round trip
			if (ticket.roundTrip && ticket.returnFlight) {
				const returnFlightId = ticket.returnFlight._id;
				const returnFlightSeatNumber = ticket.returnFlightSeatNumber;

				const returnFlightSeat = await Seat.findOne({
					flight: returnFlightId,
					seatNumber: returnFlightSeatNumber,
				});

				if (returnFlightSeat) {
					returnFlightSeat.occupied = false;
					await returnFlightSeat.save();
				}
			}
		}

		// get departure flight
		const departureFlight = await Flight.findById(
			tickets[0].departureFlight._id
		);

		// get return flight
		let returnFlight;
		if (tickets[0].roundTrip && tickets[0].returnFlight) {
			returnFlight = await Flight.findById(tickets[0].returnFlight._id);
		}

		// update departure flight booked count
		if (departureFlight) {
			if (tickets[0].seatType === 'economy') {
				departureFlight.economyBookedCount -= tickets.length;
			} else {
				departureFlight.businessBookedCount -= tickets.length;
			}
			await departureFlight.save();
		}

		if (returnFlight) {
			if (tickets[0].seatType === 'economy') {
				returnFlight.economyBookedCount -= tickets.length;
			} else {
				returnFlight.businessBookedCount -= tickets.length;
			}
			await returnFlight.save();
		}

		// Send booking cancellation email via SQS
		try {
			await sendBookingCancellationEmail(booking);
		} catch (emailError) {
			return res.status(500).json({
				message: 'Error sending booking cancellation email:',
				error: emailError.message,
			});
		}
		// return success message
		return res.status(200).json({
			message: 'Booking cancelled successfully',
		});
	} catch (error) {
		return res.status(500).json({
			message: "Failed to cancel booking. Please try again later.",
		});
	}
};

/**
 * Search bookings
 * @param {*} req
 * @param {*} res
 * @returns
 */
const searchBookingsForCustomer = async (req, res) => {
	const user = req.user._id;

	try {
		const {
			bookingId,
			pnr,
			flightFrom,
			flightTo,
			roundTrip,
			seatType,
			status,
			confirmed,
		} = req.query;

		// Get pagination parameters
		const page = parseInt(req.query.page) || 0;
		const size = parseInt(req.query.size) || 10;

		// Convert roundTrip to boolean since query params come as strings
		let isRoundTrip;
		let isConfirmed;
		if (roundTrip !== null) {
			isRoundTrip = roundTrip === 'true';
		}
		if (confirmed !== null) {
			isConfirmed = confirmed === 'true';
		}

		// Build match criteria dynamically
		const matchCriteria = {};

		if (bookingId) {
			try {
				matchCriteria._id = new mongoose.Types.ObjectId(bookingId);
			} catch (error) {
				return res.status(200).json({ booking: [], total: 0 });
			}
		}

		if (pnr) {
			matchCriteria['pnr'] = pnr;
		}

		if (flightFrom) {
			matchCriteria['tickets.departureFlight.departureAirport.city'] = {
				$eq: flightFrom,
			};
		}

		if (flightTo) {
			matchCriteria['tickets.departureFlight.arrivalAirport.city'] = {
				$eq: flightTo,
			};
		}

		if (roundTrip !== undefined) {
			matchCriteria['tickets.roundTrip'] = isRoundTrip;
		}

		if (seatType) {
			matchCriteria['tickets.seatType'] = seatType;
		}

		if (status === 'future') {
			matchCriteria['tickets.departureFlight.departureDateTime'] = {
				$gt: new Date(),
			};
		} else if (status === 'past') {
			matchCriteria['tickets.departureFlight.departureDateTime'] = {
				$lt: new Date(),
			};
		}

		if (confirmed !== undefined) {
			matchCriteria['confirmed'] = isConfirmed;
		}

		let booking;
		let total;

		try {
			// Get total count first
			const countResult = await Booking.aggregate([
				{
					$match: {
						...matchCriteria,
						'userDetails._id': new mongoose.Types.ObjectId(user),
					},
				},
				{
					$count: 'total',
				},
			]);

			total = countResult[0]?.total || 0;

			// Get paginated results
			booking = await Booking.aggregate([
				{
					$match: {
						...matchCriteria,
						'userDetails._id': new mongoose.Types.ObjectId(user),
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
				{
					$skip: page * size,
				},
				{
					$limit: size,
				},
			]);
		} catch (error) {
			return res.status(200).json({ booking: [], total: 0 });
		}

		// return booking with total count
		return res.status(200).json({
			booking,
			total,
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to search bookings. Please try again later." });
	}
};

/**
 * Search bookings for airlines
 * @param {*} req
 * @param {*} res
 * @returns
 */
const searchBookingsForAirlines = async (req, res) => {
	const user = req.user._id;

	try {
		const {
			bookingId,
			pnr,
			flightFrom,
			flightTo,
			roundTrip,
			seatType,
			status,
			confirmed,
		} = req.query;

		// Get pagination parameters
		const page = parseInt(req.query.page) || 0;
		const size = parseInt(req.query.size) || 10;

		// Convert roundTrip to boolean since query params come as strings
		let isRoundTrip;
		let isConfirmed;
		if (roundTrip !== null) {
			isRoundTrip = roundTrip === 'true';
		}
		if (confirmed !== null) {
			isConfirmed = confirmed === 'true';
		}

		// Build match criteria dynamically
		const matchCriteria = {};

		if (bookingId) {
			try {
				matchCriteria._id = new mongoose.Types.ObjectId(bookingId);
			} catch (error) {
				return res.status(200).json({ booking: [], total: 0 });
			}
		}

		if (pnr) {
			matchCriteria['pnr'] = pnr;
		}

		if (flightFrom) {
			matchCriteria['tickets.departureFlight.departureAirport.city'] = {
				$eq: flightFrom,
			};
		}

		if (flightTo) {
			matchCriteria['tickets.departureFlight.arrivalAirport.city'] = {
				$eq: flightTo,
			};
		}

		if (roundTrip !== undefined) {
			matchCriteria['tickets.roundTrip'] = isRoundTrip;
		}

		if (seatType) {
			matchCriteria['tickets.seatType'] = seatType;
		}

		if (status === 'future') {
			matchCriteria['tickets.departureFlight.departureDateTime'] = {
				$gt: new Date(),
			};
		} else if (status === 'past') {
			matchCriteria['tickets.departureFlight.departureDateTime'] = {
				$lt: new Date(),
			};
		}

		if (confirmed !== undefined) {
			matchCriteria['confirmed'] = isConfirmed;
		}

		let booking;
		let total;

		try {
			// Get total count first
			const countResult = await Booking.aggregate([
				{
					$match: {
						...matchCriteria,
						$or: [
							{
								'tickets.departureFlight.airline._id':
									new mongoose.Types.ObjectId(user),
							},
							{
								'tickets.returnFlight.airline._id': new mongoose.Types.ObjectId(
									user
								),
							},
						],
					},
				},
				{
					$count: 'total',
				},
			]);

			total = countResult[0]?.total || 0;

			// Get paginated results
			booking = await Booking.aggregate([
				{
					$match: {
						...matchCriteria,
						$or: [
							{
								'tickets.departureFlight.airline._id':
									new mongoose.Types.ObjectId(user),
							},
							{
								'tickets.returnFlight.airline._id': new mongoose.Types.ObjectId(
									user
								),
							},
						],
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
				{
					$skip: page * size,
				},
				{
					$limit: size,
				},
			]);
		} catch (error) {	
			return res.status(200).json({ booking: [], total: 0 });
		}

		// return booking with total count
		return res.status(200).json({
			booking,
			total,
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to search bookings. Please try again later." });
	}
};

/**
 * Get all bookings for customer
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getAllBookingsForCustomer = async (req, res) => {
	const user = req.user._id;

	try {
		const bookings = await Booking.find({
			'userDetails._id': new mongoose.Types.ObjectId(user),
		});

		return res.status(200).json({
			bookings
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to get all bookings. Please try again later." });
	}
};

export {
	createBooking,
	cancelBooking,
	searchBookingsForCustomer,
	searchBookingsForAirlines,
	getAllBookingsForCustomer,
};
