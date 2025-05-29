import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/seats`;

export const seatsService = {
	getSeatsForFlight: async (flightId) => {
		try {
			const response = await axios.get(`${API_URL}/get-seats-for-flight/${flightId}`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw new Error(error.message);
		}
	},

	getSeatStatus: async (flightId, seatNumber) => {
		try {
			const response = await axios.get(`${API_URL}/get-seat-status/${flightId}/${seatNumber}`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw new Error(error.message);
		}
	},
};