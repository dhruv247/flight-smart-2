import mongoose from 'mongoose';

const airlineDetailsSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
			suppressWarning: true,
		},
		airlineName: { type: String, required: true },
	},
	{ _id: false }
);

const planeDetailsSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Plane',
			suppressWarning: true,
		},
		planeName: { type: String, required: true },
		economyCapacity: { type: Number, required: true },
		businessCapacity: { type: Number, required: true },
	},
	{ _id: false }
);

const airportDetailsSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Airport',
			suppressWarning: true,
		},
		airportName: { type: String, required: true },
		airportCode: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		country: { type: String, required: true, default: 'India' },
		image: { type: String, required: true },
	},
	{ _id: false }
);

const flightSchema = new mongoose.Schema(
	{
		flightNo: { type: String, required: true, unique: true },
		airline: airlineDetailsSchema,
		plane: planeDetailsSchema,
		departureAirport: airportDetailsSchema,
		departureDate: { type: String, required: true }, // Stored as YYYY-MM-DD
		departureTime: { type: Number, required: true }, // Store as number in 24h format 1850 (Formatted in the frontend as 18:50)
		arrivalAirport: airportDetailsSchema,
		arrivalDate: { type: String, required: true }, // Stored as YYYY-MM-DD
		arrivalTime: { type: Number, required: true }, // Store as number in 24h format 1850 (Formatted in the frontend as 18:50)
		duration: { type: Number, required: true }, // Stored in minutes and converted to (2:09) using a utility function on the frontend
		economyBookedCount: { type: Number, required: true, default: 0 },
		businessBookedCount: { type: Number, required: true, default: 0 },
		economyBasePrice: { type: Number, required: true },
		businessBasePrice: { type: Number, required: true },
		economyCurrentPrice: { type: Number, required: true },
		businessCurrentPrice: { type: Number, required: true },
		changed: { type: Boolean, required: true, default: false },
	},
	{
		timestamps: true,
		strict: true,
	}
);

const Flight = mongoose.model('Flight', flightSchema);

export { airlineDetailsSchema, airportDetailsSchema, Flight };
