const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const airlineSchema = new mongoose.Schema(
	{
		airlineName: { type: String, required: true, unique: true },
		email: { type: String, lowercase: true, required: true, unique: true },
		password: { type: String }, // not required because it is initially not set (it is later set by admin after verifying airline)
		userType: {
			type: String,
			enum: ['airline'],
			required: true,
			default: 'airline',
		},
		verificationStatus: { type: Boolean, required: true, default: false },
		profilePicture: { type: String, default: 'defaultAirlinePicture.jpg' },
	},
	{
		timestamps: true,
		strict: true,
	}
);

/**
 * Pre - save for hashing password
 */
airlineSchema.pre('save', async function (next) {
	try {
		// if the password is not modified or empty (initially)
		if (!this.isModified('password') || !this.password) {
			return next();
		}

		// hash password
		const salt = await bcrypt.genSalt(6);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		console.error('Error in airline presave: ', error.message);
	}
});

module.exports = mongoose.model('Airline', airlineSchema);
