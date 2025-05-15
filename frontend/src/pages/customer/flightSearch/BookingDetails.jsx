import React from 'react';
import PassengerDetails from './PassengerDetails';
import FlightDetails from './FlightDetails';

const BookingDetails = () => {
	return (
		<div className="container my-5">
			<div className="row">
				<div className="col-md-6 col-12">
					<FlightDetails />
				</div>
				<div className="col-md-6 col-12 border-start">
					<PassengerDetails />
				</div>
			</div>
		</div>
	);
};

export default BookingDetails;
