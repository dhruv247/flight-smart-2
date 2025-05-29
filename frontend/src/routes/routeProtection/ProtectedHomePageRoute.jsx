import React from 'react';
import { Navigate } from 'react-router-dom';
import useGetUserDetails from '../../hooks/useGetUserDetails';
import Loading from '../../components/Loading';

/**
 * Protected route for home page
 */
const ProtectedHomePageRoute = ({ children }) => {
	const { user, isLoading, error } = useGetUserDetails();

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
	}

	// If there's an error or no user, allow access to home page
	if (error || !user) {
		return children;
	}

	// If user is logged in but not as customer, redirect to appropriate dashboard
	if (user.userType === 'admin') {
		return <Navigate to="/admin/dashboard/analytics" />;
	} else if (user.userType === 'airline') {
		return <Navigate to="/airline/dashboard/analytics" />;
	}

	// If user is customer or not logged in, render the children
	return children;
};

export default ProtectedHomePageRoute;
