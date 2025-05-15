import React from 'react';
import { Navigate } from 'react-router-dom';
import useGetUserDetails from '../../hooks/useGetUserDetails';
import Loading from '../../components/Loading';	

/**
 * Protected route for airline users
 * @param {React.ReactNode} children - The child components to be protected
 * @returns {React.ReactNode} The protected content or a loading indicator
 */
const ProtectedAirlineRoute = ({ children }) => {
	const { user, isLoading, error } = useGetUserDetails();

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
	}

	// If not logged in as airline, redirect to home page
	if (error || !user || user.userType !== 'airline') {
		return <Navigate to="/" />;
	}

	// If logged in as airline, render the protected content
	return children;
};

export default ProtectedAirlineRoute;