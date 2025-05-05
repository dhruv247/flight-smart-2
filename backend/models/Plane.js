const mongoose = require('mongoose');

const planeSchema = new mongoose.Schema(
	{
		planeName: { type: String, required: true, unique: true },
		economyCapacity: { type: Number, required: true },
		businessCapacity: { type: Number, required: true }
	},
	{
		timestamps: true,
		strict: true,
	}
);

module.exports = mongoose.model('Plane', planeSchema);
