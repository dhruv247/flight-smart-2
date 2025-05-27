import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api`;

export const messageService = {
	getMessages: async (conversationId) => {
		try {
			const response = await axios.get(
				`${API_URL}/messages/get-messages/${conversationId}`,
				{
					withCredentials: true,
				}
			);
			return response;
		} catch (error) {
			throw error;
		}
	},
};
