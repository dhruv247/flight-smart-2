import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/conversations`;

export const conversationService = {
	
  getConversations: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-conversations`, {
        withCredentials: true,
      });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  startConversation: async (airlineId, pnr) => {
    try {
      console.log('Starting conversation with:', { airlineId, pnr });
      const response = await axios.post(
        `${API_URL}/start-conversation`,
        { airlineId, pnr },
        { withCredentials: true }
      );
      console.log('Start conversation response:', response.data);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },
  
};