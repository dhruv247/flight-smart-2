import mongoose from 'mongoose';
import { Booking } from '../models/booking.model.js';
import { Ticket } from '../models/ticket.model.js';
import { User } from '../models/user.model.js';
import { Flight } from '../models/flight.model.js';
import { Seat } from '../models/seat.model.js';
import { sendToEmailQueue } from '../utils/sqsUtils.js';
import { sendBookingCancellationEmail } from '../utils/emailUtils.js';

/**
 * Utility function to calculate age from date of birth
 * @param {*} dateOfBirth
 * @returns {Number} age
 */
const calculateAge = (dateOfBirth) => {
	const today = new Date();
	const birthDate = new Date(dateOfBirth);
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	// if month difference is less than 0 or month difference is 0 and today's date is less than birth date, decrement age
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}

	return age;
};

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

		// get all tickets to validate ages
		const ticketDetails = await Ticket.find({ _id: { $in: tickets } });

		// check if at least one passenger is 18 or older
		const hasAdult = ticketDetails.some(
			(ticket) => calculateAge(ticket.dateOfBirth) >= 18
		);

		if (!hasAdult) {
			return res.status(400).json({
				message: 'At least one passenger must be 18 years or older',
			});
		}

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

		const booking = new Booking({
			userDetails,
			tickets: ticketsArray,
			bookingPrice,
		});

		await booking.save();

		// Send booking confirmation email via SQS
		try {
			await sendToEmailQueue(booking);
		} catch (emailError) {
			console.error('Error queuing confirmation email:', emailError);
			// The booking is still successful even if email queuing fails (solves the past error)
		}

		return res.status(201).json({
			message: 'Booking saved successfully!',
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

/**
 * Cancels a booking
 * @param {*} req
 * @param {*} res
 * @returns {Object} message
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
			message: error.message,
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
			departureAirportName,
			arrivalAirportName,
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

		if (departureAirportName) {
			matchCriteria['tickets.departureFlight.departureAirport.airportName'] = {
				// $regex: new RegExp(departureAirportName, 'i'),
				$eq: departureAirportName,
			};
		}

		if (arrivalAirportName) {
			matchCriteria['tickets.departureFlight.arrivalAirport.airportName'] = {
				// $regex: new RegExp(arrivalAirportName, 'i'),
				$eq: arrivalAirportName,
			};
		}

		if (roundTrip !== undefined) {
			matchCriteria['tickets.roundTrip'] = isRoundTrip;
		}

		if (seatType) {
			matchCriteria['tickets.seatType'] = seatType;
		}

		if (status === 'future') {
			matchCriteria['tickets.departureFlight.departureDate'] = {
				$gt: new Date().toISOString().split('T')[0],
			};
		} else if (status === 'past') {
			matchCriteria['tickets.departureFlight.departureDate'] = {
				$lt: new Date().toISOString().split('T')[0],
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
			console.error('Search error:', error);
			return res.status(200).json({ booking: [], total: 0 });
		}

		// return booking with total count
		return res.status(200).json({
			message: 'Booking retrieved successfully',
			booking,
			total,
		});
	} catch (error) {
		console.error('Search error:', error);
		return res.status(500).json({ message: error.message });
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
			departureAirportName,
			arrivalAirportName,
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

		if (departureAirportName) {
			matchCriteria['tickets.departureFlight.departureAirport.airportName'] = {
				// $regex: new RegExp(departureAirportName, 'i'),
				$eq: departureAirportName,
			};
		}

		if (arrivalAirportName) {
			matchCriteria['tickets.departureFlight.arrivalAirport.airportName'] = {
				// $regex: new RegExp(arrivalAirportName, 'i'),
				$eq: arrivalAirportName,
			};
		}

		if (roundTrip !== undefined) {
			matchCriteria['tickets.roundTrip'] = isRoundTrip;
		}

		if (seatType) {
			matchCriteria['tickets.seatType'] = seatType;
		}

		if (status === 'future') {
			matchCriteria['tickets.departureFlight.departureDate'] = {
				$gt: new Date().toISOString().split('T')[0],
			};
		} else if (status === 'past') {
			matchCriteria['tickets.departureFlight.departureDate'] = {
				$lt: new Date().toISOString().split('T')[0],
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
			console.error('Search error:', error);
			return res.status(200).json({ booking: [], total: 0 });
		}

		// return booking with total count
		return res.status(200).json({
			message: 'Booking retrieved successfully',
			booking,
			total,
		});
	} catch (error) {
		// console.error('Search error:', error);
		return res.status(500).json({ message: error.message });
	}
};

const getAllBookingsForCustomer = async (req, res) => {
	const user = req.user._id;

	try {

		const bookings = await Booking.find({
			'userDetails._id': new mongoose.Types.ObjectId(user),
		});

		return res.status(200).json({
			message: 'Bookings retrieved successfully',
			bookings,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export {
	createBooking,
	cancelBooking,
	searchBookingsForCustomer,
	searchBookingsForAirlines,
	getAllBookingsForCustomer
};