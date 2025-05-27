import mongoose from 'mongoose';

const planeSchema = new mongoose.Schema(
	{
		planeName: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		economyCapacity: {
			type: Number,
			required: true,
		},
		businessCapacity: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

// Add custom validation to ensure economy capacity is greater than business capacity
planeSchema.pre('save', function (next) {
	if (this.economyCapacity <= this.businessCapacity) {
		next(
			new Error(
				'Economy capacity must be greater than business capacity'
			)
		);
	}

	// Validate plane name format (no special characters except spaces, hyphens, and digits)
	const planeNameRegex = /^[A-Za-z0-9\s-]+$/;
	if (!planeNameRegex.test(this.planeName)) {
		next(new Error('Plane name can only contain letters, numbers, spaces, and hyphens'));
		return;
	}

	next();
});

const Plane = mongoose.model('Plane', planeSchema);

export { Plane };
