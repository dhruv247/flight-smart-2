const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, lowercase: true, required: true, unique: true }, // lowercase to maintain uniformity
		password: { type: String, required: true },
		userType: {
			type: String,
			enum: ['admin', 'customer'],
			required: true,
			default: 'customer',
		},
		profilePicture: { type: String, default: 'https://flight-smart-1-images.s3.amazonaws.com/1746185447757-defaultProfilePicture.jpeg' },
	},
	{
		timestamps: true,
		strict: true,
	}
);

/**
 * Pre - save for hashing password
 */
userSchema.pre('save', async function (next) {	
	// If password is not changed don hash again
	if (!this.isModified('password')) {
		return next();
	}

	// hash password
	const salt = await bcrypt.genSalt(6);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

module.exports = mongoose.model('User', userSchema);