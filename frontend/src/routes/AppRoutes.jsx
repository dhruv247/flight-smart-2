import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedPublicRoute from './routeProtection/ProtectedPublicRoute';
import ProtectedAdminRoute from './routeProtection/ProtectedAdminRoute';
import ProtectedCustomerRoute from './routeProtection/ProtectedCustomerRoute';
import ProtectedAirlineRoute from './routeProtection/ProtectedAirlineRoute';
import ProtectedHomePageRoute from './routeProtection/ProtectedHomePageRoute';
import ProtectedDepartureFlightsRoute from './routeProtection/ProtectedDepartureFlightsRoute';
import SignupPage from '../pages/common/register/SignupPage';
import LoginForm from '../pages/common/LoginForm';
import HomePage from '../pages/common/home/HomePage';
import AdminDashboardLayout from '../pages/admin/dashboard/AdminDashboardLayout';
import AdminDashboardAnalytics from '../pages/admin/dashboard/analytics/AdminDashboardAnalytics';
import AdminDashboardAirlines from '../pages/admin/dashboard/airlines/AdminDashboardAirlines';
import AdminDashboardAirports from '../pages/admin/dashboard/airports/AdminDashboardAirports';
import AdminDashboardPlanes from '../pages/admin/dashboard/planes/AdminDashboardPlanes';
import CustomerDashboardLayout from '../pages/customer/dashboard/CustomerDashboardLayout';
import CustomerBookingsPage from '../pages/customer/dashboard/CustomerBookingsPage';
import CustomerHelpPage from '../pages/customer/dashboard/CustomerHelpPage';
import CustomerProfilePage from '../pages/customer/dashboard/CustomerProfilePage';
import AirlineDashboardLayout from '../pages/airline/dashboard/AirlineDashboardLayout';
import AirlineDashboardAnalytics from '../pages/airline/dashboard/analytics/AirlineDashboardAnalytics';
import AirlineDashboardFlights from '../pages/airline/dashboard/flights/AirlineDashboardFlights';
import AirlineDashboardChat from '../pages/airline/dashboard/AirlineDashboardChat';
import AirlineDashboardProfile from '../pages/airline/dashboard/AirlineDashboardProfile';
import BookingsDashboard from '../components/bookings/BookingsDashboard';
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
						<LoginForm />
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

			{/* Admin Routes */}
			{/* dashboard reduncancy route (if users enter /admin/dashboard, they will be redirected correctly) */}
			<Route
				path="/admin/dashboard"
				element={
					<ProtectedAdminRoute>
						<Navigate to="/admin/dashboard/analytics" replace />
					</ProtectedAdminRoute>
				}
			/>
			{/* dashboard/analytics */}
			<Route
				path="/admin/dashboard/analytics"
				element={
					<ProtectedAdminRoute>
						<AdminDashboardLayout>
							<AdminDashboardAnalytics />
						</AdminDashboardLayout>
					</ProtectedAdminRoute>
				}
			/>
			{/* dashboard/airlines */}	
			<Route
				path="/admin/dashboard/airlines"
				element={
					<ProtectedAdminRoute>
						<AdminDashboardLayout>
							<AdminDashboardAirlines />
						</AdminDashboardLayout>
					</ProtectedAdminRoute>
				}
			/>
			{/* dashboard/airports */}
			<Route
				path="/admin/dashboard/airports"
				element={
					<ProtectedAdminRoute>
						<AdminDashboardLayout>
							<AdminDashboardAirports />
						</AdminDashboardLayout>
					</ProtectedAdminRoute>
				}
			/>
			{/* dashboard/planes */}
			<Route
				path="/admin/dashboard/planes"
				element={
					<ProtectedAdminRoute>
						<AdminDashboardLayout>
							<AdminDashboardPlanes />
						</AdminDashboardLayout>
					</ProtectedAdminRoute>
				}
			/>

			{/* Customer Routes */}
			{/* departure flights */}
			<Route
				path="/customer/departureFlights"
				element={
					<ProtectedDepartureFlightsRoute>
						<DepartureFlights />
					</ProtectedDepartureFlightsRoute>
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
			{/* dashboard reduncancy route (if users enter /customer/dashboard, they will be redirected correctly) */}
			<Route
				path="/customer/dashboard"
				element={
					<ProtectedCustomerRoute>
						<Navigate to="/customer/dashboard/bookings" replace />
					</ProtectedCustomerRoute>
				}
			/>
			{/* dashboard/bookings */}
			<Route
				path="/customer/dashboard/bookings"
				element={
					<ProtectedCustomerRoute>
						<CustomerDashboardLayout>
							<CustomerBookingsPage />
						</CustomerDashboardLayout>
					</ProtectedCustomerRoute>
				}
			/>
			{/* dashboard/help */}
			<Route
				path="/customer/dashboard/help"
				element={
					<ProtectedCustomerRoute>
						<CustomerDashboardLayout>
							<CustomerHelpPage />
						</CustomerDashboardLayout>
					</ProtectedCustomerRoute>
				}
			/>
			{/* dashboard/profile */}
			<Route
				path="/customer/dashboard/profile"
				element={
					<ProtectedCustomerRoute>
						<CustomerDashboardLayout>
							<CustomerProfilePage />
						</CustomerDashboardLayout>
					</ProtectedCustomerRoute>
				}
			/>

			{/* Airline Routes */}
			{/* dashboard reduncancy route (if users enter /airline/dashboard, they will be redirected correctly) */}
			<Route
				path="/airline/dashboard"
				element={
					<ProtectedAirlineRoute>
						<Navigate to="/airline/dashboard/analytics" replace />
					</ProtectedAirlineRoute>
				}
			/>
			{/* dashboard/analytics */}
			<Route
				path="/airline/dashboard/analytics"
				element={
					<ProtectedAirlineRoute>
						<AirlineDashboardLayout>
							<AirlineDashboardAnalytics />
						</AirlineDashboardLayout>
					</ProtectedAirlineRoute>
				}
			/>
			{/* dashboard/flights */}
			<Route
				path="/airline/dashboard/flights"
				element={
					<ProtectedAirlineRoute>
						<AirlineDashboardLayout>
							<AirlineDashboardFlights />
						</AirlineDashboardLayout>
					</ProtectedAirlineRoute>
				}
			/>
			{/* dashboard/bookings */}
			<Route
				path="/airline/dashboard/bookings"
				element={
					<ProtectedAirlineRoute>
						<AirlineDashboardLayout>
							<BookingsDashboard type="airline" />
						</AirlineDashboardLayout>
					</ProtectedAirlineRoute>
				}
			/>
			{/* dashboard/chat */}
			<Route
				path="/airline/dashboard/chat"
				element={
					<ProtectedAirlineRoute>
						<AirlineDashboardLayout>
							<AirlineDashboardChat />
						</AirlineDashboardLayout>
					</ProtectedAirlineRoute>
				}
			/>
			{/* dashboard/profile */}
			<Route
				path="/airline/dashboard/profile"
				element={
					<ProtectedAirlineRoute>
						<AirlineDashboardLayout>
							<AirlineDashboardProfile />
						</AirlineDashboardLayout>
					</ProtectedAirlineRoute>
				}
			/>

			{/* any other route */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default AppRoutes;