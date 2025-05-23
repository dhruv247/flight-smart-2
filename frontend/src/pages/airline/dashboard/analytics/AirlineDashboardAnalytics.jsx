import React, { useState, useEffect } from 'react';
import ProfitableEconomy from './ProfitableEconomy';
import ProfitableBusiness from './ProfitableBusiness';
import FlightByDuration from './FlightByDuration';
import BusyDates from './BusyDates';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AirlineDashboardAnalytics = () => {
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
						// minDate={new Date()}
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
						minDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
						className="form-control"
						name="endDate"
						id="endDate"
						dateFormat="yyyy-MM-dd"
						onChange={(date) => setEndDate(date)}
					/>
				</div>
			</div>

			{/* Profitable Economy Flights Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<ProfitableEconomy startDate={startDate} endDate={endDate} />
				</div>
			</div>

			{/* Profitable Business Flights Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<ProfitableBusiness startDate={startDate} endDate={endDate} />
				</div>
			</div>

			{/* Flights by Duration Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<FlightByDuration startDate={startDate} endDate={endDate} />
				</div>
			</div>

			{/* Busy Dates Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<BusyDates startDate={startDate} endDate={endDate} />
				</div>
			</div>
		</div>
	);
};

export default AirlineDashboardAnalytics;
