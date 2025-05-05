const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
		suppressWarning: true,
	},
	email: { type: String, required: true },
});

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

const ticketSchema = new mongoose.Schema(
	{
		userDetails: userDetailsSchema,
		departureFlightId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Flight',
			suppressWarning: true,
		},
		returnFlightId: {
			type: mongoose.Schema.Types.ObjectId,
			default: null,
			ref: 'Flight',
			suppressWarning: true,
		},
		nameOfFlyer: { type: String, required: true },
		dateOfBirth: { type: String, required: true },
		roundTrip: { type: Boolean, required: true, default: false },
		seatType: { type: String, enum: ['economy', 'business'], required: true },
		departureFlightSeatNumber: { type: Number, required: true },
		returnFlightSeatNumber: { type: Number, default: null },
		ticketPrice: { type: Number, required: true }, // combining departure and return flight
		identificationDocument: identificationDocumentSchema,
	},
	{
		timestamps: true,
		strict: true,
	}
);

module.exports = mongoose.model('Ticket', ticketSchema);
