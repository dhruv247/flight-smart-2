import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/planes`;

export const planeService = {
	getAllPlanes: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-all-planes`, {
				withCredentials: true,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};