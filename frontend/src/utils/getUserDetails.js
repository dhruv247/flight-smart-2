import axios from 'axios';

const getUserDetails = async () => {
	const endpoints = [
		'http://localhost:8000/api/user/auth/me',
		'http://localhost:8000/api/airline/auth/me',
	];

	try {
		const responses = await Promise.all(
			endpoints.map((endpoint) =>
				axios
					.get(endpoint, { withCredentials: true })
					.then((response) => response.data)
					.catch((error) => {
						// console.log(`Error fetching ${endpoint}:`, error.message);

						return null;
					})
			)
		);

		// Return the first successful response
		const validResponse = responses.find((response) => response !== null);
		if (validResponse) {
			// console.log(validResponse)
			return validResponse;
		}

		throw new Error('Not logged in');
	} catch (error) {
		// console.error('Error in getUserDetails:', error.message);
		// Propogate the error
		throw error;
	}
};

export default getUserDetails;
