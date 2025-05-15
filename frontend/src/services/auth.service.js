import axios from 'axios';

const PORT = import.meta.env.VITE_PORT;
const API_URL = `http://localhost:${PORT}/api/auth`;

const getUserDetails = async () => {
	try {
		const response = await axios.get(`${API_URL}/me`, {
			withCredentials: true,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

const verifyAirline = async (airlineId) => {
	try {
		const response = await axios.post(
			`${API_URL}/verify-airline`,
			{ airlineId },
			{ withCredentials: true }
		);
		return response.data;
	} catch (error) {
		throw error;
	}
};

const deleteAirline = async (airlineId) => {
	try {
		const response = await axios.post(
			`${API_URL}/delete-airline`,
			{ airlineId },
			{ withCredentials: true }
		);
		return response.data;
	} catch (error) {
		throw error;
	}
};

const getAllAirlines = async () => {
	try {
		const response = await axios.get(`${API_URL}/get-all-airlines`, {
			withCredentials: true,
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export { getUserDetails, verifyAirline, deleteAirline, getAllAirlines };
