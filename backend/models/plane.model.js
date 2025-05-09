import mongoose from 'mongoose';

const planeSchema = new mongoose.Schema(
	{
		planeName: { type: String, required: true, unique: true },
		economyCapacity: { type: Number, required: true },
		businessCapacity: { type: Number, required: true },
	},
	{
		timestamps: true,
		strict: true,
	}
);

const Plane = mongoose.model('Plane', planeSchema);

export { Plane };
