import { useState, useEffect } from 'react';
import { airportsService } from '../services/airport.service';

/**
 * Custom hook to fetch airports
 * @returns - The airports data
 */
export const useAirports = () => {
	const [airports, setAirports] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAirports = async () => {
			try {
				const airportsData = await airportsService.getAllAirports();
				setAirports(airportsData.data.airports.map((airport) => ({
						name: airport.airportName,
						city: airport.city,
						code: airport.airportCode,
					})));
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