import axios from 'axios';

const getUserDetails = async () => {

	try {
		const response = await axios
			.get('http://localhost:8000/api/user/auth/me', { withCredentials: true })
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