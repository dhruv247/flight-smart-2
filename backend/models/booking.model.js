import mongoose from 'mongoose';
import { departureFlightSchema, returnFlightSchema, userDetailsSchema } from './ticket.model.js';

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
	},
	{
		timestamps: true,
		strict: true,
	}
);

const Booking = mongoose.model('Booking', bookingSchema);

export { Booking };