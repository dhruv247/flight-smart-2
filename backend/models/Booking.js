const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true },
		email: { type: String, required: true },
	},
	{ _id: false }
);

const bookingSchema = new mongoose.Schema(
	{
		userDetails: userDetailsSchema,
		tickets: [
			{
				type: mongoose.Schema.Types.ObjectId,
				required: true,
				ref: 'Ticket',
				// suppressWarning: true,
			},
		],
		bookingPrice: { type: Number, required: true },
		confirmed: { type: Boolean, default: true, required: true },
	},
	{
		timestamps: true,
		strict: true,
	}
);

module.exports = mongoose.model('Booking', bookingSchema);