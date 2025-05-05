import React, { useState } from 'react';
import DashboardNavbar from '../../../../components/common/DashboardNavbar';
import UnverifiedAirlineList from './UnverifiedAirlineList';
import VerifiedAirlineList from './VerifiedAirlineList';

const AdminDashboardAirlines = () => {
	const [airlineFilter, setAirlineFilter] = useState('unverified');

	const handleFilterChange = (e) => {
		setAirlineFilter(e.target.value);
	};

	return (
		<div className="container mt-3 text-center">
			<div className="mb-3">
				<div
					className="btn-group"
					role="group"
					aria-label="Airline filter options"
				>
					<input
						type="radio"
						className="btn-check"
						name="airlineFilter"
						id="unverifiedAirlines"
						value="unverified"
						checked={airlineFilter === 'unverified'}
						onChange={handleFilterChange}
					/>
					<label
						className="btn btn-outline-primary"
						htmlFor="unverifiedAirlines"
					>
						Unverified Airlines
					</label>

					<input
						type="radio"
						className="btn-check"
						name="airlineFilter"
						id="verifiedAirlines"
						value="verified"
						checked={airlineFilter === 'verified'}
						onChange={handleFilterChange}
					/>
					<label className="btn btn-outline-primary" htmlFor="verifiedAirlines">
						Verified Airlines
					</label>
				</div>
			</div>

			{airlineFilter === 'unverified' ? (
				<UnverifiedAirlineList />
			) : (
				<VerifiedAirlineList />
			)}
		</div>
	);
};

export default AdminDashboardAirlines;
