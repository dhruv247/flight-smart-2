const mongoose = require('mongoose');

const departureFlightSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Flight',
		suppressWarning: true,
	},
	flightNo: { type: String, required: true },
	airline: { type: String, required: true },
	plane: { type: String, required: true },
	departurePlace: { type: String, required: true },
	departureDate: { type: String, required: true },
	departureTime: { type: Number, required: true },
	arrivalPlace: { type: String, required: true },
	arrivalDate: { type: String, required: true },
	arrivalTime: { type: Number, required: true },
	duration: { type: Number, required: true },
}, { _id: false });

const returnFlightSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Flight',
		suppressWarning: true,
	},
	flightNo: { type: String, required: true },
	airline: { type: String, required: true },
	plane: { type: String, required: true },
	departurePlace: { type: String, required: true },
	departureDate: { type: String, required: true },
	departureTime: { type: Number, required: true },
	arrivalPlace: { type: String, required: true },
	arrivalDate: { type: String, required: true },
	arrivalTime: { type: Number, required: true },
	duration: { type: Number, required: true },
}, { _id: false });

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

const identificationDocumentSchema = new mongoose.Schema(
	{
		documentName: {
			type: String,
			required: true,
			enum: ['passport', 'aadhaar'],
		},
		documentImage: { type: String, required: false },
	},
	{ _id: false }
);

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
		dateOfBirth: { type: String, required: true },
		roundTrip: { type: Boolean, required: true, default: false },
		seatType: { type: String, enum: ['economy', 'business'], required: true },
		departureFlightSeatNumber: { type: Number, required: true },
		returnFlightSeatNumber: { type: Number, default: null },
		ticketPrice: { type: Number, required: true },
		identificationDocument: identificationDocumentSchema,
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

module.exports = mongoose.model('Booking', bookingSchema);
