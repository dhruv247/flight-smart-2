const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
	seatNumber: { type: Number, required: true },
	seatType: { type: String, required: true, enum: ['economy', 'business'] },
	occupied: { type: Boolean, required: true, default: false },
	flight: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Flight',
		suppressWarning: true,
	},
});

module.exports = mongoose.model('Seat', seatSchema);