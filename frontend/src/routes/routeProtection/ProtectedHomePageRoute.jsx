import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import getUserDetails from '../../utils/getUserDetails';

const ProtectedHomePageRoute = ({ children }) => {
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [userType, setUserType] = useState(null);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const details = await getUserDetails();
				setUserType(details.userType);
				// Allow access if user is a customer
				if (details.userType === 'customer') {
					setIsAuthorized(true);
				} else {
					// Redirect to appropriate dashboard for other user types
					setIsAuthorized(false);
				}
			} catch (error) {
				// If error, user is not logged in - allow access
				setIsAuthorized(true);
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

	// If not authorized (logged in as admin or airline), redirect to appropriate dashboard
	if (!isAuthorized) {
		if (userType === 'admin') {
			return <Navigate to="/admin/dashboard" />;
		} else if (userType === 'airline') {
			return <Navigate to="/airline/dashboard" />;
		}
	}

	// If authorized (not logged in or logged in as customer), render the children
	return children;
};

export default ProtectedHomePageRoute;
