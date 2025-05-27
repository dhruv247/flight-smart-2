import mongoose from 'mongoose';
import { airlineDetailsSchema, airportDetailsSchema } from './flight.model.js';

const departureFlightSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Flight',
			suppressWarning: true,
		},
		flightNo: { type: String, required: true },
		airline: airlineDetailsSchema,
		plane: { type: String, required: true },
		departureAirport: airportDetailsSchema,
		departureDateTime: { type: Date, required: true },
		arrivalAirport: airportDetailsSchema,
		arrivalDateTime: { type: Date, required: true },
		duration: { type: Number, required: true },
	},
	{ _id: false }
);

const returnFlightSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Flight',
			suppressWarning: true,
		},
		flightNo: { type: String, required: true },
		airline: airlineDetailsSchema,
		plane: { type: String, required: true },
		departureAirport: airportDetailsSchema,
		departureDateTime: { type: Date, required: true },
		arrivalAirport: airportDetailsSchema,
		arrivalDateTime: { type: Date, required: true },
		duration: { type: Number, required: true },
	},
	{ _id: false }
);

const userDetailsSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
			suppressWarning: true,
		},
		email: { type: String, required: true },
		username: { type: String, required: true },
	},
	{ _id: false }
);

const ticketSchema = new mongoose.Schema(
	{
		userDetails: userDetailsSchema,
		departureFlight: departureFlightSchema,
		returnFlight: returnFlightSchema,
		nameOfFlyer: { type: String, required: true, trim: true },
		dateOfBirth: { type: String, required: true }, // format: YYYY-MM-DD
		roundTrip: { type: Boolean, required: true, default: false },
		seatType: { type: String, enum: ['economy', 'business'], required: true },
		departureFlightSeatNumber: { type: Number, required: true },
		returnFlightSeatNumber: { type: Number, default: null },
		ticketPrice: { type: Number, required: true }, // combining departure and return flight
	},
	{
		timestamps: true,
		strict: true,
	}
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export { Ticket, departureFlightSchema, returnFlightSchema, userDetailsSchema };
