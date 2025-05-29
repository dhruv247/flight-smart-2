import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
	{
		discountType: {
			type: String,
			enum: ['ageBased'],
			required: true,
			unique: false,
		},
		discountStyle: {
			type: String,
			enum: ['percentage', 'fixed'],
			required: true,
		},
		discountFor: {
			type: String,
			required: true,
		},
		discountValue: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{
		// Disable auto index
		autoIndex: false,
		strict: true,
		timestamps: true,
	}
);

// Pre-validation middleware
discountSchema.pre('validate', function (next) {
	// Validate percentage discounts (0-100)
	if (
		this.discountStyle === 'percentage' &&
		(this.discountValue < 0 || this.discountValue > 100)
	) {
		this.invalidate(
			'discountValue',
			'Percentage discount must be between 0 and 100'
		);
	}

	// Validate fixed amount discounts (must be positive)
	if (this.discountStyle === 'fixed' && this.discountValue <= 0) {
		this.invalidate(
			'discountValue',
			'Fixed discount amount must be greater than 0'
		);
	}

	next();
});

// Drop any existing indexes except _id
discountSchema.index({ discountType: 1 }, { unique: false });

const Discount = mongoose.model('Discount', discountSchema);

export default Discount;
