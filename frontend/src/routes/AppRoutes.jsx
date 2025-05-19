import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedPublicRoute from './routeProtection/ProtectedPublicRoute';
import ProtectedAdminRoute from './routeProtection/ProtectedAdminRoute';
import ProtectedCustomerRoute from './routeProtection/ProtectedCustomerRoute';
import ProtectedAirlineRoute from './routeProtection/ProtectedAirlineRoute';
import ProtectedHomePageRoute from './routeProtection/ProtectedHomePageRoute';
import SignupPage from '../pages/common/register/SignupPage';
import LoginPage from '../pages/common/login/LoginPage';
import HomePage from '../pages/common/home/HomePage';
import AdminDashboardPage from '../pages/admin/dashboard/AdminDashboardPage';
import CustomerDashboardPage from '../pages/customer/dashboard/CustomerDashboardPage';
import AirlineDashboardPage from '../pages/airline/dashboard/AirlineDashboardPage';
import DepartureFlights from '../pages/customer/flightSearch/DepartureFlights';
import ReturnFlights from '../pages/customer/flightSearch/ReturnFlights';
import BookingDetails from '../pages/customer/flightSearch/BookingDetails';
import NotFound from '../pages/common/NotFound';

const AppRoutes = () => {
	return (
		<Routes>
			{/* Common Routes */}
			{/* HomePage */}
			<Route
				path="/"
				element={
					<ProtectedHomePageRoute>
						<HomePage />
					</ProtectedHomePageRoute>
				}
			/>
			{/* login */}
			<Route
				path="/login"
				element={
					<ProtectedPublicRoute>
						<LoginPage />
					</ProtectedPublicRoute>
				}
			/>
			{/* Signup */}
			<Route
				path="/signup"
				element={
					<ProtectedPublicRoute>
						<SignupPage />
					</ProtectedPublicRoute>
				}
			/>

			{/* admin routes */}
			{/* dashboard */}
			<Route
				path="/admin/dashboard"
				element={
					<ProtectedAdminRoute>
						<AdminDashboardPage />
					</ProtectedAdminRoute>
				}
			/>

			{/* customer routes */}
			{/* departure flights */}
			<Route
				path="/customer/departureFlights"
				element={
					<ProtectedCustomerRoute>
						<DepartureFlights />
					</ProtectedCustomerRoute>
				}
			/>
			{/* return flights */}
			<Route
				path="/customer/returnFlights"
				element={
					<ProtectedCustomerRoute>
						<ReturnFlights />
					</ProtectedCustomerRoute>
				}
			/>
			{/* passenger details */}
			<Route
				path="/customer/bookingDetails"
				element={
					<ProtectedCustomerRoute>
						<BookingDetails />
					</ProtectedCustomerRoute>
				}
			/>
			{/* dashboard */}
			<Route
				path="/customer/dashboard"
				element={
					<ProtectedCustomerRoute>
						<CustomerDashboardPage />
					</ProtectedCustomerRoute>
				}
			/>

			{/* airline routes */}
			{/* dashboard */}
			<Route
				path="/airline/dashboard"
				element={
					<ProtectedAirlineRoute>
						<AirlineDashboardPage />
					</ProtectedAirlineRoute>
				}
			/>

			{/* any other route */}
			<Route path="*" element={<NotFound />} />

		</Routes>
	);
};

export default AppRoutes;
