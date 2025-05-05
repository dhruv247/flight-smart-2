import React, { useState } from 'react';
import DashboardNavbar from '../../../components/common/DashboardNavbar';
import AirlineDashboardChat from './chat/AirlineDashboardChat';
import AirlineDashboardFlights from './flights/AirlineDashboardFlights';
import AirlineDashboardProfile from './profile/AirlineDashboardProfile';
import AirlineDashboardAirline from './analytics/AirlineDashboardAnalytics';

const AirlineDashboardPage = () => {
	const [activeComponent, setActiveComponent] = useState('analytics');

	const airlineNavItems = [
		{ id: 'analytics', label: 'Analytics', icon: 'bi-bar-chart' },
		{ id: 'flights', label: 'Flights', icon: 'bi-airplane' },
		{ id: 'chat', label: 'Chat', icon: 'bi-chat' },
		{ id: 'profile', label: 'Profile', icon: 'bi-person' },
	];

	const renderComponent = () => {
		switch (activeComponent) {
			case 'chat':
				return <AirlineDashboardChat />;
			case 'flights':
				return <AirlineDashboardFlights />;
			case 'profile':
				return <AirlineDashboardProfile />;
			case 'analytics':
				return <AirlineDashboardAirline />;
			default:
				return <div>Welcome to Airline Dashboard</div>;
		}
	};

	return (
		<div className="vh-100 d-flex flex-column">
			<DashboardNavbar
				activeComponent={activeComponent}
				setActiveComponent={setActiveComponent}
				navItems={airlineNavItems}
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

export default AirlineDashboardPage;
