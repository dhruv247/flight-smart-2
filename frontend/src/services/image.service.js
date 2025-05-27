import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/images`;

export const imageService = {
	uploadImage: async (image) => {
		try {
			const response = await axios.post(`${API_URL}/upload-image`, image, {
				withCredentials: true,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response;
		} catch (error) {
			throw new Error(error.message);
		}
	},
};
