import React, { useState } from 'react';
import AddAirport from './AddAirport';
import ViewAirports from './ViewAirports';

/**
 * Admin dashboard airports page - choose between adding and viewing airports
 */
const AdminDashboardAirports = () => {
	const [dashboardOption, setDashboardOption] = useState('addAirport');

	const handleDashboardOptionChange = (e) => {
		setDashboardOption(e.target.value);
	};

	return (
		<div className="container mt-3 text-center">
			<div className="mb-3">
				<div className="btn-group" role="group">
					<input
						type="radio"
						className="btn-check"
						name="dashboardOption"
						id="addAirport"
						value="addAirport"
						checked={dashboardOption === 'addAirport'}
						onChange={handleDashboardOptionChange}
					/>
					<label htmlFor="addAirport" className="btn btn-outline-primary">
						Add Airport
					</label>

					<input
						type="radio"
						className="btn-check"
						name="dashboardOption"
						id="viewAirports"
						value="viewAirports"
						checked={dashboardOption === 'viewAirports'}
						onChange={handleDashboardOptionChange}
					/>
					<label htmlFor="viewAirports" className="btn btn-outline-primary">
						View Airports
					</label>
				</div>
			</div>

			{dashboardOption === 'addAirport' ? <AddAirport /> : <ViewAirports />}
		</div>
	);
};

export default AdminDashboardAirports;
