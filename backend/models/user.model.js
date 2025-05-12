import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, lowercase: true, required: true, unique: true },
		password: { type: String, required: true },
		userType: {
			type: String,
			enum: ['admin', 'customer', 'airline'],
			required: true,
			default: 'customer',
		},
		profilePicture: {
			type: String,
			default:
				"https://flight-smart-1-images.s3.amazonaws.com/1746975947571-default.jpeg",
		},
		verificationStatus: { type: Boolean, required: true, default: true },
	},
	{
		timestamps: true,
		strict: true,
	}
);

// hash password if it is modified
userSchema.pre('save', async function (next) {
	
	if (!this.isModified('password')) {
		return next();
	}

	const salt = await bcrypt.genSalt(6);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

const User = mongoose.model('User', userSchema);

export { User };