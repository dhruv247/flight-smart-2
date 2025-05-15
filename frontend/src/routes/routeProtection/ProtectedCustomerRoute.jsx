import React from 'react';
import { Navigate } from 'react-router-dom';
import useGetUserDetails from '../../hooks/useGetUserDetails';
import Loading from '../../components/Loading';

/**
 * Protected route for customer users
 * @param {React.ReactNode} children - The child components to be protected
 * @returns {React.ReactNode} The protected content or a loading indicator
 */
const ProtectedCustomerRoute = ({ children }) => {
	const { user, isLoading, error } = useGetUserDetails();

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
	}

	// If not logged in as customer, redirect to home page
	if (error || !user || user.userType !== 'customer') {
		return <Navigate to="/" />;
	}

	// If logged in as customer, render the protected content
	return children;
};

export default ProtectedCustomerRoute;
