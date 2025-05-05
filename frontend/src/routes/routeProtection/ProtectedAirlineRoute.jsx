import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import getUserDetails from '../../utils/getUserDetails';

const ProtectedAirlineRoute = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const details = await getUserDetails();

				if (details.userType === 'airline') {
					setIsLoggedIn(true);
				} else {
					setIsLoggedIn(false);
				}
			} catch (error) {
				setIsLoggedIn(false);
			} finally {
				setIsLoading(false);
			}
		};
		checkAuthStatus();
	}, []);

	// Show loading state while checking authentication
	if (isLoading) {
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status"></div>
				{/* <p className="mt-2">Authenticating...</p> */}
			</div>
		);
	}

	// If not logged in as airline, redirect to home page
	if (!isLoggedIn) {
		return <Navigate to="/" />;
	}

	// If logged in as airline, render the protected content
	return children;
};

export default ProtectedAirlineRoute;