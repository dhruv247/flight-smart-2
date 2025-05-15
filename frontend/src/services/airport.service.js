import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/airports`;

export const airportsService = {
	getAllAirports: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-all-airports`, {
				withCredentials: true,
			});
			return response.data.airports.map((airport) => ({
				name: airport.airportName,
				city: airport.city,
				code: airport.airportCode,
			}));
		} catch (error) {
			throw new Error(error.message);
		}
	},
};