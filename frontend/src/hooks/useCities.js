import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCities = () => {
	const [cities, setCities] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCities = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8000/api/cities/getAll',
					{
						withCredentials: true,
					}
				);
				const citiesData = response.data.cities.map((city) => city.name);
				setCities(citiesData);
			} catch (error) {
				setError(error.message);
				// console.error('Error fetching cities:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCities();
	}, []);

	return { cities, isLoading, error };
};
