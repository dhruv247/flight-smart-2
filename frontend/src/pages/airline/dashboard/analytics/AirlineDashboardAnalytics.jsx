import React from 'react';
import ProfitableEconomy from './ProfitableEconomy';
import ProfitableBusiness from './ProfitableBusiness';
import FlightByDuration from './FlightByDuration';
import BusyDates from './BusyDates';

const AirlineDashboardAnalytics = () => {
	return (
		<div className="row g-4">
			{/* Profitable Economy Flights Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<ProfitableEconomy />
				</div>
			</div>

			{/* Profitable Business Flights Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<ProfitableBusiness />
				</div>
			</div>

			{/* Flights by Duration Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<FlightByDuration />
				</div>
			</div>

			{/* Busy Dates Chart */}
			<div className="col-12 col-xl-6">
				<div className="bg-white rounded-3 p-4 h-100 shadow-sm">
					<BusyDates />
				</div>
			</div>
		</div>
	);
};

export default AirlineDashboardAnalytics;
