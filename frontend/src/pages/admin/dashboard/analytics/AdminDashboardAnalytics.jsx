import React, { useState } from 'react';
import TopAirlines from './TopAirlines';
import TopCities from './TopCities';
import TopPlanes from './TopPlanes';
import TopDepartureTimes from './TopDepartureTimes';
import TopTravelClass from './TopTravelClass';
import TopRoutes from './TopRoutes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Admin Dashboard Analytics to display analytics (graphs) for the admin
 */
const AdminDashboardAnalytics = () => {
	const [numFlights, setNumFlights] = useState(5);
	const [numAirlines, setNumAirlines] = useState(5);
	const [numCities, setNumCities] = useState(5);
	const [numPlanes, setNumPlanes] = useState(5);
	const [numRoutes, setNumRoutes] = useState(5);
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(
		new Date(new Date().setDate(new Date().getDate() + 7))
	);

	return (
		<div className="row g-4">
			<div className="col-12 d-flex justify-content-center gap-2">
				<div className="border rounded-3 p-2">
					<p className="mb-1 fw-semibold">Start Date</p>
					<DatePicker
						selected={startDate}
						className="form-control"
						name="startDate"
						id="startDate"
						dateFormat="yyyy-MM-dd"
						onChange={(date) => setStartDate(date)}
					/>
				</div>
				<div className="border rounded-3 p-2">
					<p className="mb-1 fw-semibold">End Date</p>
					<DatePicker
						selected={endDate}
						minDate={startDate}
						className="form-control"
						name="endDate"
						id="endDate"
						dateFormat="yyyy-MM-dd"
						onChange={(date) => setEndDate(date)}
					/>
				</div>
			</div>

			{/* Top Planes by Number of Flights */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						{/* <h5 className="mb-0">Top Planes</h5> */}
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
					<TopPlanes
						noOfTopPlanes={numPlanes}
						startDate={startDate}
						endDate={endDate}
					/>
				</div>
			</div>

			{/* Top Airlines by Number of Flights */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						{/* <h5 className="mb-0">Top Airlines</h5> */}
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
					<TopAirlines
						noOfTopAirlines={numAirlines}
						startDate={startDate}
						endDate={endDate}
					/>
				</div>
			</div>

			{/* Top Cities by Number of Flights */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						{/* <h5 className="mb-0">Top Cities</h5> */}
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
					<TopCities
						noOfTopCities={numCities}
						startDate={startDate}
						endDate={endDate}
					/>
				</div>
			</div>

			{/* Top Flights Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<TopDepartureTimes startDate={startDate} endDate={endDate} />
				</div>
			</div>

			{/* Top Routes */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<select
							className="form-select form-select-sm w-auto"
							value={numRoutes}
							onChange={(e) => setNumRoutes(Number(e.target.value))}
						>
							<option value="5">Top 5</option>
							<option value="10">Top 10</option>
							<option value="15">Top 15</option>
							<option value="20">Top 20</option>
						</select>
					</div>
					<TopRoutes
						noOfTopRoutes={numRoutes}
						startDate={startDate}
						endDate={endDate}
					/>
				</div>
			</div>

			{/* Travel Class Distribution */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<TopTravelClass startDate={startDate} endDate={endDate} />
				</div>
			</div>
		</div>
	);
};

export default AdminDashboardAnalytics;
