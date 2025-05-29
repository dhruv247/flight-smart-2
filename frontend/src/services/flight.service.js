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
			const response = await axios.post(
				`${API_URL}/create-flight`,
				flightData,
				{
					withCredentials: true,
				}
			);
			return response;
		} catch (error) {
			throw error;
		}
	},

	searchFlightsForAirline: async (searchParams) => {
		try {
			const response = await axios.get(
				`${API_URL}/search-flights-for-airline`,
				{
					params: searchParams,
					withCredentials: true,
				}
			);
			return response;
		} catch (error) {
			throw error;
		}
	},

	// searchFlights: async (formData) => {
	// 	try {
	// 		const response = await axios.post(`${API_URL}/search-flights`, formData, { withCredentials: true });
	// 		return response;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// },

	getFlightById: async (flightId) => {
		try {
			const response = await axios.get(`${API_URL}/get-flight-by-id/${flightId}`, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	},

	updateFlightPrice: async (flightId) => {
		try {
			const response = await axios.patch(`${API_URL}/update-flight-price/${flightId}`, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	},

	searchFlightsForCustomer: async (formData) => {
		try {
			const response = await axios.get(`${API_URL}/search-flights-for-customer?${formData}`, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	},
};
