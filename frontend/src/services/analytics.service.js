import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/analytics`;

export const analyticsService = {

	// Airline Analytics

	getTopDatesByNumberOfFlights: async (startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-dates-by-number-of-flights?startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getProfitableBusinessFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/profitable-business-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getProfitableEconomyFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/profitable-economy-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getFlightsByDuration: async (startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/flights-by-duration?startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopEconomyOccupancyFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-economy-occupancy-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopBusinessOccupancyFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-business-occupancy-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Admin Analytics

	getTopAirlinesByNumberOfFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-airlines-by-number-of-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopPlanesByNumberOfFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-planes-by-number-of-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopDepartureTimes: async (startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-departure-times?startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopCitiesByNumberOfFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-cities-by-number-of-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopTravelClassByOccupancy: async (startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-travel-class-by-occupancy?startDate=${startDate}&endDate=${endDate}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getTopRoutesByNumberOfFlights: async (limit, startDate, endDate) => {
		try {
			const response = await axios.get(
				`${API_URL}/top-routes-by-number-of-flights?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
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