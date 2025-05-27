import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/tickets`;

export const ticketService = {
	createTicket: async (ticket) => {
		try {
			const response = await axios.post(`${API_URL}/create-ticket`, ticket, { withCredentials: true });
			return response;
    } catch (error) { 
      throw error;
    }
  }
};