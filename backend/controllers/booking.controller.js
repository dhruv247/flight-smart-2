import mongoose from 'mongoose';
import { Booking } from '../models/booking.model.js';
import { Ticket } from '../models/ticket.model.js';
import { User } from '../models/user.model.js';
import { Flight } from '../models/flight.model.js';
import { Seat } from '../models/seat.model.js';
import { sendBookingConfirmationEmail } from '../utils/emailUtils.js';

/**
 * Calculate age from date of birth
 * @param {*} dateOfBirth
 * @returns
 */
const calculateAge = (dateOfBirth) => {
	const today = new Date();
	const birthDate = new Date(dateOfBirth);
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

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

		// send confirmation email
		await sendBookingConfirmationEmail(user, booking);

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
 * Get bookings for logged in user
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getBookingsForCustomer = async (req, res) => {
	try {

		// destructure req user
		const userId = req.user._id;

		// get bookings
		const bookings = await Booking.aggregate([
			{
				$match: {
					'userDetails._id': new mongoose.Types.ObjectId(userId),
				},
			},
			{
				$sort: {
					createdAt: -1,
				},
			},
		]);

		return res.status(200).json({
			message: 'Bookings retrieved successfully',
			bookings,
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
 * @returns
 * 1. changes the booking status (confirmed to false)
 * 2. changes the occupied seats to unoccupied
 * 3. reduces the booked seat count of the departure and return flight for economy and business class
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

		const departureFlight = await Flight.findById(
			tickets[0].departureFlight._id
		);
		let returnFlight;
		if (tickets[0].roundTrip && tickets[0].returnFlight) {
			returnFlight = await Flight.findById(tickets[0].returnFlight._id);
		}

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

export { createBooking, getBookingsForCustomer, cancelBooking };