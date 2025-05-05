import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import getUserDetails from '../../utils/getUserDetails';

const ProtectedCustomerRoute = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const details = await getUserDetails();

				if (details.userType === 'customer') {
					setIsLoggedIn(true);
				} else {
					setIsLoggedIn(false);
				}
			} catch (error) {
				console.error('Error checking customer status:', error);
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

	// If not logged in as customer, redirect to home page
	if (!isLoggedIn) {
		return <Navigate to="/" />;
	}

	// If logged in as customer, render the protected content
	return children;
};

export default ProtectedCustomerRoute;