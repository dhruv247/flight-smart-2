import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/discounts`;

export const discountService = {
	getDiscounts: async () => {
		try {
			const response = await axios.get(`${API_URL}/get-discounts?discountType=ageBased`, { withCredentials: true });
			return response;
    } catch (error) {
      throw error;
    }
  }
};