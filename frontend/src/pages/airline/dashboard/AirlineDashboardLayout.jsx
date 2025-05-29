import React from 'react';
import DashboardNavbar from '../../../components/navbars/DashboardNavbar';

/**
 * Airline Dashboard Layout - for the base dashboard
 */
const AirlineDashboardLayout = ({ children }) => {
	const airlineNavItems = [
		{
			id: 'analytics',
			label: 'Analytics',
			icon: 'bi-bar-chart',
			path: '/airline/dashboard/analytics',
		},
		{
			id: 'flights',
			label: 'Flights',
			icon: 'bi-airplane',
			path: '/airline/dashboard/flights',
		},
		{
			id: 'bookings',
			label: 'Bookings',
			icon: 'bi-calendar-check',
			path: '/airline/dashboard/bookings',
		},
		{
			id: 'chat',
			label: 'Chat',
			icon: 'bi-chat',
			path: '/airline/dashboard/chat',
		},
		{
			id: 'profile',
			label: 'Profile',
			icon: 'bi-person',
			path: '/airline/dashboard/profile',
		},
	];

	return (
		<div className="vh-100 d-flex flex-column">
			<DashboardNavbar navItems={airlineNavItems} />

			<div className="flex-grow-1 bg-light" style={{ overflow: 'hidden' }}>
				<div className="container h-100 py-4">
					<div
						className="bg-white rounded-3 shadow-sm h-100 d-flex flex-column"
						style={{ maxHeight: 'calc(100vh - 100px)' }}
					>
						<div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AirlineDashboardLayout;
