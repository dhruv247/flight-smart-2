import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAirports = () => {
	const [airports, setAirports] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAirports = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8000/api/airports/get-all-airports',
					{
						withCredentials: true,
					}
				);
				const airportsData = response.data.airports.map((airport) => ({
					name: airport.airportName,
					city: airport.city,
					code: airport.airportCode,
				}));
				setAirports(airportsData);
			} catch (error) {
				setError(error.message);
				// console.error('Error fetching airports:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAirports();
	}, []);

	return { airports, isLoading, error };
};
