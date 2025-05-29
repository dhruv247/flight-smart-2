import mongoose from 'mongoose';
import {
	departureFlightSchema,
	returnFlightSchema,
	userDetailsSchema,
} from './ticket.model.js';

/**
 * Utility function to calculate age from date of birth
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

const embeddedTicketSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Ticket',
			suppressWarning: true,
		},
		departureFlight: departureFlightSchema,
		returnFlight: returnFlightSchema,
		nameOfFlyer: { type: String, required: true },
		dateOfBirth: { type: String, required: true }, // format: YYYY-MM-DD
		roundTrip: { type: Boolean, required: true, default: false },
		seatType: { type: String, enum: ['economy', 'business'], required: true },
		departureFlightSeatNumber: { type: Number, required: true },
		returnFlightSeatNumber: { type: Number, default: null },
		ticketPrice: { type: Number, required: true },
	},
	{ _id: false }
);

const bookingSchema = new mongoose.Schema(
	{
		userDetails: userDetailsSchema,
		tickets: [embeddedTicketSchema],
		bookingPrice: { type: Number, required: true },
		confirmed: { type: Boolean, default: true, required: true },
		pnr: { type: String, required: true, unique: true },
	},
	{
		timestamps: true,
		strict: true,
	}
);

// Pre-save middleware to validate booking
bookingSchema.pre('save', async function (next) {
	try {
		// Check if at least one passenger is 18 or older
		const hasAdult = this.tickets.some(
			(ticket) => calculateAge(ticket.dateOfBirth) >= 18
		);

		if (!hasAdult) {
			throw new Error('At least one passenger must be 18 years or older');
		}

		// Validate booking price matches sum of ticket prices
		const calculatedPrice = this.tickets.reduce(
			(sum, ticket) => sum + Number(ticket.ticketPrice),
			0
		);

		if (calculatedPrice !== this.bookingPrice) {
			throw new Error('Booking price does not match sum of ticket prices');
		}

		next();
	} catch (error) {
		next(error);
	}
});

const Booking = mongoose.model('Booking', bookingSchema);

export { Booking };
