import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/airports`;

export const airportsService = {
	getAllAirports: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-all-airports`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw new Error(error.message);
		}
	},

	addAirport: async (airport) => {
		try {
			const response = await axios.post(`${API_URL}/add-airport`, airport, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw error;
		}
	},
};
