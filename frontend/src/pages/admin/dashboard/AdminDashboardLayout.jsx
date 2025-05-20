import React from 'react';
import DashboardNavbar from '../../../components/navbars/DashboardNavbar';

const AdminDashboardLayout = ({ children }) => {
	const adminNavItems = [
		{
			id: 'analytics',
			label: 'Analytics',
			icon: 'bi-graph-up',
			path: '/admin/dashboard/analytics',
		},
		{
			id: 'airlines',
			label: 'Airlines',
			icon: 'bi-airplane-fill',
			path: '/admin/dashboard/airlines',
		},
		{
			id: 'airports',
			label: 'Airports',
			icon: 'bi-building',
			path: '/admin/dashboard/airports',
		},
		{
			id: 'planes',
			label: 'Planes',
			icon: 'bi-airplane-engines',
			path: '/admin/dashboard/planes',
		},
	];

	return (
		<div className="vh-100 d-flex flex-column">
			<DashboardNavbar navItems={adminNavItems} />

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

export default AdminDashboardLayout;
