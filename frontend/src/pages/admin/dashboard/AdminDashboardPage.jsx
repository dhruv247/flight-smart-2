import React, { useState } from 'react';
import DashboardNavbar from '../../../components/navbars/DashboardNavbar';
import AdminDashboardAirlines from './airlines/AdminDashboardAirlines';
import AdminDashboardAirports from './airports/AdminDashboardAirports';
import AdminDashboardAnalytics from './analytics/AdminDashboardAnalytics';
import AdminDashboardPlanes from './planes/AdminDashboardPlanes';

const AdminDashboardPage = () => {
	const [activeComponent, setActiveComponent] = useState('analytics');

	const adminNavItems = [
		{ id: 'analytics', label: 'Analytics', icon: 'bi-graph-up' },
		{ id: 'airlines', label: 'Airlines', icon: 'bi-airplane-fill' },
		{ id: 'airports', label: 'Airports', icon: 'bi-building' },
		{ id: 'planes', label: 'Planes', icon: 'bi-airplane-engines' },
	];

	const renderComponent = () => {
		switch (activeComponent) {
			case 'airlines':
				return <AdminDashboardAirlines />;
			case 'analytics':
				return <AdminDashboardAnalytics />;
			case 'airports':
				return <AdminDashboardAirports />;
			case 'planes':
				return <AdminDashboardPlanes />;
			default:
				return <div>Welcome to Admin Dashboard</div>;
		}
	};

	return (
		<div className="vh-100 d-flex flex-column">
			{/* Navbar with Navigation */}
			<DashboardNavbar
				activeComponent={activeComponent}
				setActiveComponent={setActiveComponent}
				navItems={adminNavItems}
			/>

			{/* Main Content Area with Fixed Height */}
			<div className="flex-grow-1 bg-light" style={{ overflow: 'hidden' }}>
				<div className="container h-100 py-4">
					<div
						className="bg-white rounded-3 shadow-sm h-100 d-flex flex-column"
						style={{ maxHeight: 'calc(100vh - 100px)' }} // Adjust based on navbar height
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

export default AdminDashboardPage;
