import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/flights`;

export const flightService = {
	getAllFlightsForAirline: async (page, size) => {
		try {
			const response = await axios.get(
				`${API_URL}/get-all-flights-for-airline?page=${page}&size=${size}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},


	createFlight: async (flightData) => {
		try {
			const response = await axios.post(`${API_URL}/create-flight`, flightData, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw error;
		}
	},
};
