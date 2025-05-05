import React, { useState } from 'react';
import TopFlights from './TopFlights';
import TopAirlines from './TopAirlines';
import TopCities from './TopCities';
import TopPlanes from './TopPlanes';

const AdminDashboardAnalytics = () => {
	const [numFlights, setNumFlights] = useState(5);
	const [numAirlines, setNumAirlines] = useState(5);
	const [numCities, setNumCities] = useState(5);
	const [numPlanes, setNumPlanes] = useState(5);

	return (
		<div className="row g-4">
			{/* Top Flights Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="mb-0">Top Flights</h5>
						<select
							className="form-select form-select-sm w-auto"
							value={numFlights}
							onChange={(e) => setNumFlights(Number(e.target.value))}
						>
							<option value="5">Top 5</option>
							<option value="10">Top 10</option>
							<option value="15">Top 15</option>
							<option value="20">Top 20</option>
						</select>
					</div>
					<TopFlights noOfTopFlights={numFlights} />
				</div>
			</div>

			{/* Top Airlines by Number of Flights */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="mb-0">Top Airlines</h5>
						<select
							className="form-select form-select-sm w-auto"
							value={numAirlines}
							onChange={(e) => setNumAirlines(Number(e.target.value))}
						>
							<option value="5">Top 5</option>
							<option value="10">Top 10</option>
							<option value="15">Top 15</option>
							<option value="20">Top 20</option>
						</select>
					</div>
					<TopAirlines noOfTopAirlines={numAirlines} />
				</div>
			</div>

			{/* Top Cities by Number of Flights */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="mb-0">Top Cities</h5>
						<select
							className="form-select form-select-sm w-auto"
							value={numCities}
							onChange={(e) => setNumCities(Number(e.target.value))}
						>
							<option value="5">Top 5</option>
							<option value="10">Top 10</option>
							<option value="15">Top 15</option>
							<option value="20">Top 20</option>
						</select>
					</div>
					<TopCities noOfTopCities={numCities} />
				</div>
			</div>

			{/* Top Planes by Number of Flights */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="mb-0">Top Planes</h5>
						<select
							className="form-select form-select-sm w-auto"
							value={numPlanes}
							onChange={(e) => setNumPlanes(Number(e.target.value))}
						>
							<option value="5">Top 5</option>
							<option value="10">Top 10</option>
							<option value="15">Top 15</option>
							<option value="20">Top 20</option>
						</select>
					</div>
					<TopPlanes noOfTopPlanes={numPlanes} />
				</div>
			</div>
		</div>
	);
};

export default AdminDashboardAnalytics;
