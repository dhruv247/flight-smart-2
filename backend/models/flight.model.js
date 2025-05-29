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
		state: { type: String },
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
		departureDateTime: { type: Date, required: true }, // Store as date
		arrivalAirport: airportDetailsSchema,
		arrivalDateTime: { type: Date, required: true }, // Store as date
		duration: { type: Number }, // Stored in minutes and converted to (2:09) using a utility function on the frontend
		economyBookedCount: { type: Number, required: true, default: 0 },
		businessBookedCount: { type: Number, required: true, default: 0 },
		economyBasePrice: { type: Number, required: true },
		businessBasePrice: { type: Number, required: true },
		economyCurrentPrice: { type: Number },
		businessCurrentPrice: { type: Number },
		changed: { type: Boolean, required: true, default: false },
	},
	{
		timestamps: true,
		strict: true,
	}
);

// Add pre-save middleware for validations
flightSchema.pre('save', async function (next) {
	try {
		// Validate departure datetime
		const departureDate = new Date(this.departureDateTime);
		if (isNaN(departureDate.getTime())) {
			throw new Error('Invalid departure date and time format');
		}

		// Validate arrival datetime
		const arrivalDate = new Date(this.arrivalDateTime);
		if (isNaN(arrivalDate.getTime())) {
			throw new Error('Invalid arrival date and time format');
		}

		// Validate economy base price
		if (
			isNaN(this.economyBasePrice) ||
			this.economyBasePrice < 1000 ||
			this.economyBasePrice > 10000
		) {
			throw new Error(
				'Economy base price must be a number between ₹1000 and ₹10000'
			);
		}

		// Validate business base price
		if (
			isNaN(this.businessBasePrice) ||
			this.businessBasePrice < 3000 ||
			this.businessBasePrice > 30000
		) {
			throw new Error(
				'Business base price must be a number between ₹3000 and ₹30000'
			);
		}

		// Validate business price is not less than economy price
		if (this.businessBasePrice <= this.economyBasePrice) {
			throw new Error(
				'Business base price must be greater than economy base price'
			);
		}

		// Validate departure and arrival cities are different
		if (this.departureAirport.airportName === this.arrivalAirport.airportName) {
			throw new Error('Departure and arrival cities must be different');
		}

		// Get current date
		const currentDate = new Date();

		// Validate departure date is at least 1 hour ahead of now
		const oneHourFromNow = new Date(currentDate.getTime() + 60 * 60 * 1000);
		if (departureDate < oneHourFromNow) {
			throw new Error(
				'Departure date and time must be at least 1 hour from now'
			);
		}

		// Validate arrival date is today or later
		if (arrivalDate < currentDate) {
			throw new Error('Arrival date must be today or later');
		}

		// Validate arrival is at least 1 hour after departure
		if (arrivalDate <= departureDate) {
			throw new Error(
				'Arrival time must be at least 1 hour after departure time'
			);
		}

		// Calculate duration in minutes
		const durationInMs = arrivalDate.getTime() - departureDate.getTime();
		const duration = Math.ceil(durationInMs / (1000 * 60));

		// Validate minimum duration of 1 hour (60 minutes)
		if (duration < 60) {
			throw new Error('Flight duration must be at least 1 hour (60 minutes)');
		}

		// Validate maximum duration of 4 hours (240 minutes)
		if (duration > 240) {
			throw new Error('Flight duration cannot exceed 4 hours (240 minutes)');
		}

		// Set the duration
		this.duration = duration;

		// Set initial current prices equal to base prices
		this.economyCurrentPrice = this.economyBasePrice;
		this.businessCurrentPrice = this.businessBasePrice;

		next();
	} catch (error) {
		next(error);
	}
});

const Flight = mongoose.model('Flight', flightSchema);

export { airlineDetailsSchema, airportDetailsSchema, Flight };
