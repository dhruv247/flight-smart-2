import React, { useEffect, useState } from 'react';
import PassengerDetails from './PassengerDetails';
import FlightDetails from './FlightDetails';
import { Link } from 'react-router-dom';
import { useFlightContext } from '../../../hooks/useFlightContext';
import HomeNavbar from '../../../components/navbars/HomeNavbar';

/**
 * Booking Details - used to display flights details and passenger details components
 */
const BookingDetails = () => {

	const [route, setRoute] = useState('/customer/departureFlights');

	return (
		<div>
			<HomeNavbar />
			<div className="container my-5">
				<div className="d-flex justify-content-start mt-5">
					<Link to={route}>
					<button className="btn btn-primary px-3 py-2">
						<i class="bi bi-arrow-left"></i> Go Back
					</button>
				</Link>
			</div>
			<div className="row mt-5">
				<div className="col-md-6 col-12 my-2">
					<FlightDetails />
				</div>
				<div className="col-md-6 col-12 border-start my-2">
					<PassengerDetails />
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookingDetails;
