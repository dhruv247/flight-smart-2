import axios from 'axios';

/**
 * Get the details of the logged in user
 * @returns {Promise<Object>} The user details
 * @throws {Error} If the user is not logged in
 */
const getUserDetails = async () => {
	try {
		const response = await axios
			.get('http://localhost:8000/api/auth/me', { withCredentials: true })
			.then((response) => response.data)
			.catch((error) => {
				throw error;
			});

		if (response) {
			return response;
		}

		throw new Error('Not logged in');
	} catch (error) {
		throw error;
	}
};

export default getUserDetails;