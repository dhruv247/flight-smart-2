import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

/**
 * React hook to get the details of the logged in user
 * @returns {Object} { user, loading, error }
 */
const useGetUserDetails = () => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchUserDetails = async () => {
			try {
				const userData = await authService.getUserDetails();
				setUser(userData.data);
				setError(null);
			} catch (err) {
				setError(err);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserDetails();
	}, []);

	return { user, isLoading, error };
};

export default useGetUserDetails;