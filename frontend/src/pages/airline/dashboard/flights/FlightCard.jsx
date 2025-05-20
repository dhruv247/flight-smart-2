import React from 'react';
import formatDateTime from '../../../../utils/dateTime';

const FlightCard = ({ flight }) => {
	if (!flight) return null;

	return (
		<div className="row border border-subtle rounded m-0 mb-3 py-2 align-items-center bg-white">
			<div className="col-12 col-md-1">
				<p>{flight.flightNo}</p>
			</div>
			<div className="col-12 col-md-1">
				<p>{flight.plane.planeName}</p>
			</div>
			<div className="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
				<div className="align-items-center">
					<p>{flight.departureAirport.city}</p>
					<p>{formatDateTime(flight.departureDateTime).time}</p>
					<p>{formatDateTime(flight.departureDateTime).date}</p>
				</div>
				<p>-</p>
				<div className="align-items-center">
					<p>{flight.arrivalAirport.city}</p>
					<p>{formatDateTime(flight.arrivalDateTime).time}</p>
					<p>{formatDateTime(flight.arrivalDateTime).date}</p>
				</div>
			</div>
			<div className="col-12 col-md-1">
				<p>
					{Math.floor(flight.duration / 60)} hr : {(flight.duration % 60).toString().padStart(2, '0')} min
				</p>
			</div>
			<div className="col-12 col-md-3 d-flex justify-content-around align-items-center">
				<div className="col-6 ">
					<p>B: ₹{flight.businessBasePrice}</p>
					<p>E: ₹{flight.economyBasePrice}</p>
				</div>
				<div className="col-6">
					<p>B: ₹{flight.businessCurrentPrice}</p>
					<p>E: ₹{flight.economyCurrentPrice}</p>
				</div>
			</div>

			<div className="col-12 col-md-3 d-flex justify-content-around align-items-center">
				<div className="col-6">
					<p>B: {flight.plane.businessCapacity}</p>
					<p>E: {flight.plane.economyCapacity}</p>
				</div>
				<div className="col-6">
					<p>B: {flight.plane.businessCapacity - flight.businessBookedCount}</p>
					<p>E: {flight.plane.economyCapacity - flight.economyBookedCount}</p>
				</div>
			</div>
		</div>
	);
};

export default FlightCard;