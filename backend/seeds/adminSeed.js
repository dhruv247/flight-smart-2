import { User } from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Create admin user
 * @returns {Promise<void>} - A promise that resolves when the admin user is created
 * @description
 * 1. Check if an admin exists in db
 * 2. If it does throw an error
 * 3. Create a new admin document for User collection
 * 4. Save admin to User
 */
const createAdminUser = async () => {
	try {

		const adminExists = await User.findOne({ userType: 'admin' });
			
		if (adminExists) {
			throw new Error('Admin already exists!');
		}

		const adminUser = new User({
			username: process.env.ADMIN_USERNAME,
			email: process.env.ADMIN_EMAIL,
			password: process.env.ADMIN_PASSWORD,
			userType: 'admin',
		});

		await adminUser.save();

		console.log('Admin user created successfully!');
	} catch (error) {
		console.log('Error creating admin user:', error.message);
	}
};

export { createAdminUser };
