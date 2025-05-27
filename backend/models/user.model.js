import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: function (v) {
					return v.length <= 30;
				},
				message: 'Username must be less than 30 characters',
			},
		},
		email: {
			type: String,
			lowercase: true,
			required: true,
			unique: true,
			validate: {
				validator: function (v) {
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
				},
				message: 'Please provide a valid email address',
			},
		},
		password: {
			type: String,
			required: true,
			validate: {
				validator: function (v) {
					// Skip password validation if we're only updating verification status (because password is hashed)
					if (
						this.isModified('verificationStatus') &&
						!this.isModified('password')
					) {
						return true;
					}
					return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
						v
					);
				},
				message:
					'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
			},
		},
		userType: {
			type: String,
			enum: {
				values: ['admin', 'customer', 'airline'],
				message: '{VALUE} is not a valid user type',
			},
			required: true,
			default: 'customer',
		},
		profilePicture: {
			type: String,
			default:
				'https://flight-smart-1-images.s3.amazonaws.com/1746975947571-default.jpeg',
			validate: {
				validator: function (v) {
					// Only validate if userType is airline
					if (this.userType === 'airline') {
						return v && v.length > 0;
					}
					return true;
				},
				message: 'Airline profile picture is required',
			},
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

// Prevent admin creation through registration
userSchema.pre('save', function (next) {
	if (this.isNew && this.userType === 'admin') {
		next(new Error('Admin cannot be created through registration'));
	}
	next();
});

const User = mongoose.model('User', userSchema);

export { User };
