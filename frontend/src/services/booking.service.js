import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/bookings`;

export const bookingService = {
	searchBookingsForCustomer: async (queryParams) => {
		try {
			const response = await axios.get(`${API_URL}/search-bookings-for-customer?${queryParams}`, {
				withCredentials: true,
      });
      return response;
		} catch (error) {
			throw new Error(error.message);
		}
	},

	searchBookingsForAirlines: async (queryParams) => {
		try {
			const response = await axios.get(`${API_URL}/search-bookings-for-airline?${queryParams}`, {
				withCredentials: true,
			});
			return response;
		} catch (error) {
			throw new Error(error.message);
		}
  },
  
  getAllBookingsForCustomer: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-all-bookings-for-customer`, {
        withCredentials: true,
      });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  },

	createBooking: async (booking) => {
		try {
			const response = await axios.post(`${API_URL}/create-booking`, booking, { withCredentials: true });
			return response;
		} catch (error) {
			throw new Error(error.message);
		}
	},
};