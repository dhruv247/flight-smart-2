import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/messages`;

const getCustomersForAirline = async () => {
	const response = await axios.get(`${API_URL}/get-customers-for-airline`, {
		withCredentials: true,
	});
	return response.data;
};

const getAirlinesForCustomer = async () => {
	const response = await axios.get(`${API_URL}/get-airlines-for-customer`, {
		withCredentials: true,
	});
	return response.data;
};

const getConversation = async (userId, otherUserId, token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	const response = await axios.get(
		`${API_URL}/get-conversation/${userId}/${otherUserId}`,
		config
	);
	return response.data;
};

const messageService = {
	getCustomersForAirline,
	getAirlinesForCustomer,
	getConversation,
};

export default messageService;
