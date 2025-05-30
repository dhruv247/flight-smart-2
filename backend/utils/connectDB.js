import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async function () {
	return mongoose
		.connect(process.env.MONGODB_URI)
		.then(() => console.log('MongoDB Connected!'))
		.catch((err) => console.log('Error Connecting to MongoDB!', err.message));
};

export { connectDB };