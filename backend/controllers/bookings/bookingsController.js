const Booking = require('../../models/Booking');
const Ticket = require('../../models/Ticket');
const User = require('../../models/User');
const Flight = require('../../models/Flight');
const Seat = require('../../models/Seat');
const { sendBookingConfirmationEmail } = require('../../utils/emailUtils');

// Helper function to calculate age from date of birth
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
 * @description
 * 1. Gets the tickets
 * 2. adds ticket prices to get booking price
 * 3. create booking
 */
exports.create = async (req, res) => {
	try {
		const { tickets } = req.body;

		const user = await User.findById(req.user._id);

		// Get all tickets to validate ages
		const ticketDetails = await Ticket.find({ _id: { $in: tickets } });

		// Check if at least one passenger is 18 or older
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

		// Limited operations can be done using simple loop
		for (let ticket of ticketDetails) {
			bookingPrice += Number(ticket.ticketPrice);
		}

		const userDetails = {
			_id: user._id,
			email: user.email,
		};

		const booking = new Booking({
			userDetails,
			tickets,
			bookingPrice,
		});

		await booking.save();

		// Send confirmation email
		await sendBookingConfirmationEmail(user, booking);

		return res.status(201).json({
			message: 'Booking saved successfully!',
		});
	} catch (error) {
		console.error('Error creating booking!', error);
		return res.status(500).json({
			message: 'Error Creating booking',
			error: error.message,
		});
	}
};

/**
 * Get bookings for logged in user
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getBookings = async (req, res) => {
	try {
		const userId = req.user._id;

		const bookings = await Booking.aggregate([
			{
				$match: {
					'userDetails._id': userId,
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
		// console.error('Error getting bookings:', error);
		return res.status(500).json({
			message: 'Error retrieving bookings',
			error: error.message,
		});
	}
};

/**
 * Cancels a booking
 * @param {*} req
 * @param {*} res
 * @returns
 * 1. Changes the booking status (confirmed to false)
 * 2. Changes the occupied seats to unoccupied
 * 3. REduces the booked seat count of the departure and return flight for economy and business class
 */
exports.cancelBooking = async (req, res) => {
	try {
		const bookingId = req.params.id;
		const booking = await Booking.findById(bookingId);

		if (!booking) {
			return res.status(404).json({
				message: 'Booking not found',
			});
		}

		booking.confirmed = false;
		await booking.save();

		const ticketIds = booking.tickets;

		const tickets = await Ticket.find({ _id: { $in: ticketIds } });

		for (let ticket of tickets) {
			const departureFlightId = ticket.departureFlightId;
			const returnFlightId = ticket.returnFlightId;

			const departureFlightSeatNumber = ticket.departureFlightSeatNumber;
			const returnFlightSeatNumber = ticket.returnFlightSeatNumber;

			const departureFlightSeat = await Seat.findOne({
				flight: departureFlightId,
				seatNumber: departureFlightSeatNumber,
			});
			let returnFlightSeat;
			if (returnFlightId) {
				returnFlightSeat = await Seat.findOne({
					flight: returnFlightId,
					seatNumber: returnFlightSeatNumber,
				});
			}

			if (departureFlightSeat) {
				departureFlightSeat.occupied = false;
				await departureFlightSeat.save();
			}

			if (returnFlightSeat) {
				returnFlightSeat.occupied = false;
				await returnFlightSeat.save();
			}
		}

		const departureFlight = await Flight.findById(tickets[0].departureFlightId);
		let returnFlight;
		if (tickets[0].roundTrip) {
			returnFlight = await Flight.findById(tickets[0].returnFlightId);
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
		return res.status(200).json({
			message: 'Booking cancelled successfully',
			tickets,
		});
	} catch (error) {
		// console.error('Error cancelling booking:', error);
		return res.status(500).json({
			message: 'Error cancelling booking',
			error: error.message,
		});
	}
};
