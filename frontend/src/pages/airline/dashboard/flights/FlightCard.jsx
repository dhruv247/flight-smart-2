import React from 'react';

const FlightCard = ({ flight }) => {
	const formatTime = (time) => {
		const hours = Math.floor(time / 100);
		const minutes = time % 100;
		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}`;
	};

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
					<p>{formatTime(flight.departureTime)}</p>
					<p>{flight.departureDate}</p>
				</div>
				<p>-</p>
				<div className="align-items-center">
					<p>{flight.arrivalAirport.city}</p>
					<p>{formatTime(flight.arrivalTime)}</p>
					<p>{flight.arrivalDate}</p>
				</div>
			</div>
			<div className="col-12 col-md-1">
				<p>
					{Math.floor(flight.duration / 60)}:
					{(flight.duration % 60).toString().padStart(2, '0')}
				</p>
			</div>
			<div className="col-12 col-md-3 d-flex justify-content-around align-items-center">
				<div className="col-6">
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
					<p>
						B:{' '}
						{flight.plane.businessCapacity - flight.businessBookedCount}
					</p>
					<p>
						E: {flight.plane.economyCapacity - flight.economyBookedCount}
					</p>
				</div>
			</div>
		</div>
	);
};

export default FlightCard;
