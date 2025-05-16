import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api`;

const getMessages = async (conversationId) => {
	const response = await axios.get(
		`${API_URL}/messages/get-messages/${conversationId}`,
		{
			withCredentials: true,
		}
	);
	return response.data;
};

const getConversations = async () => {
	try {
		console.log('Fetching customer conversations');
		const response = await axios.get(
			`${API_URL}/conversations/get-conversations-for-customer`,
			{
				withCredentials: true,
			}
		);
		console.log('Customer conversations response:', response.data);
		return response.data.conversations;
	} catch (error) {
		console.error('Error fetching customer conversations:', error);
		throw error;
	}
};

const getAirlineConversations = async () => {
	try {
		console.log('Fetching airline conversations');
		const response = await axios.get(
			`${API_URL}/conversations/get-conversations-for-airline`,
			{
				withCredentials: true,
			}
		);
		console.log('Airline conversations response:', response.data);
		return response.data.conversations;
	} catch (error) {
		console.error('Error fetching airline conversations:', error);
		throw error;
	}
};

const startConversation = async (airlineId, bookingId) => {
	try {
		console.log('Starting conversation with:', { airlineId, bookingId });
		const response = await axios.post(
			`${API_URL}/conversations/start-conversation`,
			{ airlineId, bookingId },
			{ withCredentials: true }
		);
		console.log('Start conversation response:', response.data);
		return response.data;
	} catch (error) {
		console.error('Error starting conversation:', error);
		throw error;
	}
};

const messageService = {
	getMessages,
	getConversations,
	getAirlineConversations,
	startConversation,
};

export default messageService;
