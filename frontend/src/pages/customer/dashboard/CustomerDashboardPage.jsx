import React, { useState } from 'react';
import DashboardNavbar from '../../../components/common/DashboardNavbar';
import CustomerDashboardBookings from './bookings/CustomerDashboardBookings';
import CustomerDashboardProfile from './profile/CustomerDashboardProfile';
import CustomerDashboardChat from './chat/CustomerDashboardChat';

const CustomerDashboardPage = () => {
	const [activeComponent, setActiveComponent] = useState('bookings');

	const customerNavItems = [
		{ id: 'bookings', label: 'Bookings', icon: 'bi-calendar-check' },
		{ id: 'chat', label: 'Chat', icon: 'bi-chat-dots' },
		{ id: 'profile', label: 'Profile', icon: 'bi-person' },
	];

	const renderComponent = () => {
		switch (activeComponent) {
			case 'bookings':
				return <CustomerDashboardBookings />;
			case 'chat':
				return <CustomerDashboardChat />;
			case 'profile':
				return <CustomerDashboardProfile />;
			default:
				return <div>Welcome to Customer Dashboard</div>;
		}
	};

	return (
		<div className="vh-100 d-flex flex-column">
			<DashboardNavbar
				activeComponent={activeComponent}
				setActiveComponent={setActiveComponent}
				navItems={customerNavItems}
			/>

			<div className="flex-grow-1 bg-light" style={{ overflow: 'hidden' }}>
				<div className="container h-100 py-4">
					<div
						className="bg-white rounded-3 shadow-sm h-100 d-flex flex-column"
						style={{ maxHeight: 'calc(100vh - 100px)' }}
					>
						<div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
							{renderComponent()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerDashboardPage;
