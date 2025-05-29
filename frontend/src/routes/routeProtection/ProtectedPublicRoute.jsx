import React from 'react';
import { Navigate } from 'react-router-dom';
import useGetUserDetails from '../../hooks/useGetUserDetails';
import Loading from '../../components/Loading';

/**
 * Protected route for public pages (login/signup pages)
 */
const ProtectedPublicRoute = ({ children }) => {
	const { user, isLoading, error } = useGetUserDetails();

	// Show loading state while checking authentication
	if (isLoading) {
		return <Loading />;
	}

	// If user is logged in, redirect to home page
	if (user) {
		return <Navigate to="/" />;
	}

	// If not logged in, render the children (login/signup pages)
	return children;
};

export default ProtectedPublicRoute;