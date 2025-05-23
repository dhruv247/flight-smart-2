import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema(
	{
		airportName: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: [3, 'Airport name must be at least 3 characters long'],
			maxlength: [100, 'Airport name cannot exceed 100 characters'],
		},
		airportCode: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			uppercase: true,
			minlength: [3, 'Airport code must be exactly 3 characters'],
			maxlength: [3, 'Airport code must be exactly 3 characters'],
		},
		city: {
			type: String,
			required: true,
			trim: true,
			minlength: [2, 'City name must be at least 2 characters long'],
			maxlength: [50, 'City name cannot exceed 50 characters'],
		},
		state: { type: String },
		country: { type: String, required: true, default: 'India' },
		image: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

// Pre-save validation
airportSchema.pre('save', function (next) {
	// Validate airport code format (must be 3 uppercase letters)
	const airportCodeRegex = /^[A-Z]{3}$/;
	if (!airportCodeRegex.test(this.airportCode)) {
		next(new Error('Airport code must be exactly 3 uppercase letters'));
		return;
	}

	// Validate image URL format
	const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
	if (!imageUrlRegex.test(this.image)) {
		next(new Error('Image must be a valid URL ending with an image extension'));
		return;
	}

	// Validate airport name format (no special characters except spaces and hyphens)
	const airportNameRegex = /^[A-Za-z\s-]+$/;
	if (!airportNameRegex.test(this.airportName)) {
		next(
			new Error('Airport name can only contain letters, spaces, and hyphens')
		);
		return;
	}

	// Validate city name format (no special characters except spaces and hyphens)
	const cityNameRegex = /^[A-Za-z\s-]+$/;
	if (!cityNameRegex.test(this.city)) {
		next(new Error('City name can only contain letters, spaces, and hyphens'));
		return;
	}

	next();
});

const Airport = mongoose.model('Airport', airportSchema);

export { Airport };