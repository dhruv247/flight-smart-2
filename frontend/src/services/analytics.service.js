import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/analytics`;

export const analyticsService = {
	getTopDatesByNumberOfFlights: async () => {
		try {
			const response = await axios.get(
				`${API_URL}/top-dates-by-number-of-flights`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getProfitableBusinessFlights: async (limit) => {
		try {
			const response = await axios.get(
				`${API_URL}/profitable-business-flights?limit=${limit}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getProfitableEconomyFlights: async (limit) => {
		try {
			const response = await axios.get(
				`${API_URL}/profitable-economy-flights?limit=${limit}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getFlightsByDuration: async () => {
		try {
			const response = await axios.get(`${API_URL}/flights-by-duration`, {
				withCredentials: true,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopAirlinesByNumberOfFlights: async (num) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-airlines-by-number-of-flights?num=${num}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopPlanesByNumberOfFlights: async (num) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-planes-by-number-of-flights?num=${num}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopDepartureFlightsByNumberOfTickets: async (num) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-departure-flights-by-number-of-tickets?num=${num}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopCitiesByNumberOfFlights: async (num) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-cities-by-number-of-flights?num=${num}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};
