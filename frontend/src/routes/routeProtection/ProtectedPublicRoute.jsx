import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import getUserDetails from '../../utils/getUserDetails';

/**
 * 
 * @param {*} param0 
 * @returns 
 * @description
 * Provides front end route protection against logged in users
 *  - If a user is logged in, they are not able to navigate to pages restrcited by this function
 */
const ProtectedPublicRoute = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				await getUserDetails();
				setIsLoggedIn(true);
			} catch (error) {
				// If error the user is not logged in
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

	// If logged in redirect to home page
	if (isLoggedIn) {
		return <Navigate to="/" />;
	}

	// If not logged in render the children (login/signup pages)
	return children;
};

export default ProtectedPublicRoute;