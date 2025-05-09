import mongoose from 'mongoose';

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

const Seat = mongoose.model('Seat', seatSchema);

export { Seat };
