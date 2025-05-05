const User = require('../models/User');
require('dotenv').config();

/**
 * create an admin (if he/she doesn't exist yet)
 */
const createAdminUser = async () => {
	try {

		// check if an admin exists in db
		const adminExists = await User.findOne({ userType: 'admin' });

		// if it does thro an error
		if (adminExists) {
			throw new Error('Admin already exists!');
		}

		// create a new admin document for User collection
		const adminUser = new User({
			username: process.env.ADMIN_USERNAME,
			email: process.env.ADMIN_EMAIL,
			password: process.env.ADMIN_PASSWORD,
			userType: 'admin',
		});

		// save admin to User
		await adminUser.save();
		console.log('Admin user created successfully!');
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = createAdminUser;
