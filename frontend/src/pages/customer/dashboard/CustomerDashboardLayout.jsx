import React from 'react';
import DashboardNavbar from '../../../components/navbars/DashboardNavbar';

const CustomerDashboardLayout = ({ children }) => {
	const customerNavItems = [
		{
			id: 'bookings',
			label: 'Bookings',
			icon: 'bi-calendar-check',
			path: '/customer/dashboard/bookings',
		},
		{
			id: 'help',
			label: 'Help',
			icon: 'bi-chat-dots',
			path: '/customer/dashboard/help',
		},
		{
			id: 'profile',
			label: 'Profile',
			icon: 'bi-person',
			path: '/customer/dashboard/profile',
		},
	];

	return (
		<div className="vh-100 d-flex flex-column">
			<DashboardNavbar navItems={customerNavItems} />

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

export default CustomerDashboardLayout;
