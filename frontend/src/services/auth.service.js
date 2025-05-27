import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/auth`;

export const authService = {
	getUserDetails: async () => {
		try {
			const response = await axios.get(`${API_URL}/me`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw error;
		}
	},

	verifyAirline: async (airlineId) => {
		try {
			const response = await axios.post(
				`${API_URL}/verify-airline`,
				{ airlineId },
				{ withCredentials: true }
			);
			return response;
		} catch (error) {
			throw error;
		}
	},

	deleteAirline: async (airlineId) => {
		try {
			const response = await axios.post(
				`${API_URL}/delete-airline`,
				{ airlineId },
				{ withCredentials: true }
			);
			return response;
		} catch (error) {
			throw error;
		}
	},

	getAllAirlines: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-all-airlines`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw error;
		}
	},

	logout: async () => {
		try {
			const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	},

	register: async (formData) => {
		try {
			const response = await axios.post(`${API_URL}/register`, formData, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	},

	login: async (formData) => {
		try {
			const response = await axios.post(`${API_URL}/login`, formData, { withCredentials: true });
			return response;
		} catch (error) {
			throw error;
		}
	},
};