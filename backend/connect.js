const mongoose = require('mongoose');
require('dotenv').config();

/**
 * 
 * @returns 
 */
const connectDB = async function () {
	return mongoose
		.connect(process.env.MONGODB_URI)
		.then(() => console.log('MongoDB Connected!'))
		.catch((err) => console.log('Error Connecting to MongoDB!', err.message));
};

module.exports = { connectDB };