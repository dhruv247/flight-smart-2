import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/planes`;

export const planeService = {
	addPlane: async (plane) => {
		try {
			const response = await axios.post(`${API_URL}/add-plane`, plane, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw error;
		}
	},

	getAllPlanes: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-all-planes`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw error;
		}
	},
};
