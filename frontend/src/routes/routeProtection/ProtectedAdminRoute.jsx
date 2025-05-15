import React from 'react';
import { Navigate } from 'react-router-dom';
import useGetUserDetails from '../../hooks/useGetUserDetails';
import Loading from '../../components/Loading';

/**
 * Protected route for admin users
 * @param {React.ReactNode} children - The child components to be protected
 * @returns {React.ReactNode} The protected content or a loading indicator
 */
const ProtectedAdminRoute = ({ children }) => {
	
	// Get user details
	const { user, isLoading, error } = useGetUserDetails();

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
	}

	// If not logged in as admin or there's an error, redirect to home page
	if (error || !user || user.userType !== 'admin') {
		return <Navigate to="/" />;
	}

	// If logged in as admin, render the protected content
	return children;
};

export default ProtectedAdminRoute;
