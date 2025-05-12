import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema({
	airportName: { type: String, required: true, unique: true },
	airportCode: { type: String, required: true, unique: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	country: { type: String, required: true, default: 'India' },
	image: { type: String, required: true },
}, {
	timestamps: true,
	strict: true,
});

const Airport = mongoose.model('Airport', airportSchema);

export { Airport };